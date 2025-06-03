import yaml
import cv2
import numpy as np
import mediapipe as mp
import joblib
from typing import Dict, List, Tuple
from collections import deque
from pathlib import Path
import pandas as pd

from .utils import extract_features, load_user_calibration
import time



class StretchTracker:
    """
    실시간 스트레칭 추적기 + 이상 탐지 모델 연동
    - 연속 landmark 특징을 모델에 입력하여 수행 여부 판단
    """

    def __init__(self, exercise: str, frame_interval_ms: int = 30):
        # stretch_model/
        base_dir = Path(__file__).resolve().parent.parent

        # config 로드 (yaml)
        cfg_path = base_dir / "config" / f"{exercise}.yaml" # config 파일 경로
        with cfg_path.open(encoding="utf-8") as f:
            self.cfg = yaml.safe_load(f) # config 파일의 yaml을 읽어옴
        
        self.exercise = exercise # 운동 이름
        self.frame_interval_ms = frame_interval_ms # 초당 프레임 수 -> 운동 지속 시간(초) 계산할 때 사용

        # threshold (yaml에서 보고 가져옴)
        '''추후 최소 시간이 없는 경우도 추가해야 할 수도 있음'''
        self.min_hold = self.cfg['thresholds']['min_hold_duration_sec'] # 최소 유지 시간
        self.target_count = self.cfg['cycles']['count'] # 목표 반복 횟수
        self.required_window = self.cfg.get('model', {}).get('window_size', 10) # 필요한 윈도우 크기 (모델에 따라 다름, 기본값 10)

        # 상태 변수
        self.current_side = None
        self.frame_idx = 0
        self.hold_start_time = None  # 실제 시간 기반으로 변경
        self.counts = {}
        self.done_sides = set()

        
        # 모델 로딩 전 방향을 가지는 동작인지 판단 후 결과에 따라 다른 방식으로 로딩
        self.has_direction = 'direction' in self.cfg and self.cfg['direction']
        self.sides = self.cfg['direction'] if self.has_direction else [None]

        # 모델 로딩
        model_dir = base_dir / "models" # 모델 경로
        self.models = {}
        for side in self.sides:

            # 만약 방향이 없으면 model filenames 에 "_<side>"라는 suffix(접미사)가 생략됨 

            suffix = f"_{side}" if side else ""
            m_path = model_dir / f"{exercise}{suffix}_anomaly.joblib"
            s_path = model_dir / f"{exercise}{suffix}_scaler.joblib"
            if m_path.exists() and s_path.exists():
                self.models[side] = {
                    "model":  joblib.load(m_path),
                    "scaler": joblib.load(s_path),
                }
                # 각 방향 별 횟수 지정
                self.counts[side] = 0
            else:
                print(f"Warning: model/scaler missing for side={side}: {m_path.name}, {s_path.name}")

        # MediaPipe Pose 초기화
        self.pose = mp.solutions.pose.Pose(static_image_mode=False)

        # direction 설정
        self.direction_cfg = self.cfg.get('direction', {})

        # config 이용해서 feature 정의
        self.feature_defs = self.cfg['features']
        self.feature_names = [f['name'] for f in self.feature_defs]

        self.calibration = self.cfg.get('calibration')
        self.z_scale = self.cfg.get('model', {}).get('z_scale', 1.0)

        # 추적 결과 저장
        self.landmark_history = []

    def extract_landmarks(self, image: np.ndarray, user_id : int) -> Dict[str, float] | None:
        """
        한 프레임(image)에서 상체 랜드마크를 뽑아
        config에 정의된 feature를 계산한 후
        {feature_name: value} dict로 반환한다.
        사람이 검출되지 않으면 None을 반환.
        """
        image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        # 결과는 init에 생성해 둔 self.pose 사용 (매번 재사용)
        result = self.pose.process(image_rgb)
        # 프레임에 사람이 없는 경우를 예외처리
        if not result.pose_landmarks:
            result['feedback_messages'] = ["포즈를 감지할 수 없습니다. 카메라 앞에 서주세요."]
            return None

        # landmarks dict 만들기: { index: (x, y, z) }
        allowed = set(self.cfg.get('landmarks', []))
        lm = {
            idx: (pt.x, pt.y, pt.z)
            for idx, pt in enumerate(result.pose_landmarks.landmark)
            if idx in allowed # config에 정의된 랜드마크만 사용
        }

        # landmarks를 DataFrame으로 변환 (각 landmark의 x, y, z 좌표를 열로)
        row = {}
        for idx, coords in lm.items():
            row[f'x{idx}'], row[f'y{idx}'], row[f'z{idx}'] = coords
        df = pd.DataFrame([row])

        
        feat_df = extract_features(
            df,
            self.feature_defs,
            calibration=load_user_calibration(user_id),
            z_scale=self.z_scale
        )

        return feat_df.iloc[0].astype(float).to_dict()

    def detect_direction(self, feats: Dict[str, float]) -> str:
        """
        방향 판단: left/right/None
        """
        for side, rules in self.direction_cfg.items():
            ok = True
            for feat, cond in rules.items():
                val = feats.get(feat, 0)
                thr = cond.get('threshold', 0)
                if cond.get('sign') == 'positive' and val < thr:
                    ok = False; break
                if cond.get('sign') == 'negative' and val > -thr:
                    ok = False; break
            if ok:
                return side
        return None

    def is_performing(self, user_id : int, image: np.ndarray, outlier_threshold: float = -0.2) -> Dict:
        self.frame_idx += 1
        current_time = time.time()
        
        feats = self.extract_landmarks(image, user_id)

        result = {
            'exercise': self.exercise,
            'current_side': self.current_side,
            'elapsed_time': 0.0,
            'counts': dict(self.counts),
            'completed': False,
            'feedback_messages': [],  # 피드백 메시지 추가
            'feedback_type': 'error'
        }

        if self.done_sides == set(self.sides):
            self.reset()
        
        if feats is None:
            result['feedback_messages'] = ["포즈를 감지할 수 없습니다. 카메라 앞에 서주세요."]
            return result

        # DataFrame으로 변환하여 임계값 검사용으로 사용
        feat_df = pd.DataFrame([feats])

        # 1) 방향 결정
        side = self.detect_direction(feats)
        result['current_side'] = side

        if side is None and self.has_direction:
            self.feature_buffer.clear() 
            self.hold_start = None
            result['feedback_messages'] = ["올바른 자세를 취해주세요."]
            return result

        # 1.5) 기본 임계값 검사 및 피드백 생성
        base_conditions, base_feedback = self.check_base_conditions_with_feedback(feat_df)
        
        # 1.6) 방향별 임계값 검사 및 피드백 생성 (방향이 있는 경우)
        direction_passed = True
        direction_feedback = []
        if side and 'directional_thresholds' in self.cfg:
            direction_passed, direction_feedback = self.check_directional_conditions_with_feedback(
                feat_df, side
            )
        
        # 전체 피드백 수집
        all_feedback = base_feedback + direction_feedback
        result['feedback_messages'] = all_feedback

        # 2) feature_buffer에 벡터 추가
        vec = np.array([feats[n] for n in self.feature_names])
        self.feature_buffer.append(vec)
        
        # 3) 모델 예측 (윈도우가 찼을 때만)
        performing = False
        model_feedback = []
        
        if len(self.feature_buffer) == self.required_window:
            X_win = np.stack(self.feature_buffer, axis=0)
            X_win_df = pd.DataFrame(X_win, columns=self.feature_names)
            
            # 모델이 있는 경우에만 모델 예측 사용
            if side in self.models:
                scaler = self.models[side]['scaler'] 
                model  = self.models[side]['model']
                X_scaled = scaler.transform(X_win_df)
            
            try:
                score = model.decision_function(X_scaled)[0]
                print(f"Anomaly score: {score:.3f}")
                
                # 임계값 기반 판정 (조정 가능)
                performing = score >= outlier_threshold

            except AttributeError:
                scores = None

            # 이상치 판정
            if scores is not None:
                inliers = scores >= outlier_threshold
                vote_ratio = inliers.mean()
                print("Inlier flags:", inliers.astype(int))
            else:
                preds = model.predict(X_scaled)
                inliers = (preds == 1)
                vote_ratio = inliers.mean()

            vote_thr = self.cfg.get('model', {}).get('vote_threshold', 0.6)
            performing = vote_ratio >= vote_thr
            
            # 모델 기반 피드백 생성
            if not performing:
                model_feedback = [f"동작이 부정확합니다. 올바른 {self.exercise} 자세를 확인해주세요."]
        else:
            # 모델이 없는 경우 임계값 기반으로만 판단
            base_passed = base_conditions.any() if len(base_conditions) > 0 else True
            performing = base_passed and direction_passed
            
            if not performing:
                model_feedback = ["자세를 개선해주세요."]

        # 모델 피드백도 추가
        result['feedback_messages'].extend(model_feedback)

        '''추후 rep 경우 추가해야 할 수도 있음'''
        # 4) performing 이 True일 때만 hold 로직
        if performing:
            if self.current_side != side:
                self.current_side = side
                try:
                    if 'inliers' in locals():
                        first_true_idx = np.argmax(inliers)
                        self.hold_start = self.frame_idx - self.required_window + 1 + first_true_idx
                    else:
                        self.hold_start = self.frame_idx
                except:
                    self.hold_start = self.frame_idx  # fallback


            if self.hold_start is None:
                self.hold_start = self.frame_idx

            elapsed = (self.frame_idx - self.hold_start) * (self.frame_interval_ms / 100)
            result['elapsed_time'] = elapsed

            # 진행률 피드백 (선택적)
            if elapsed < self.min_hold:
                progress_feedback = f"좋습니다! {elapsed:.1f}초/{self.min_hold}초 진행 중입니다."
                result['feedback_messages'] = [progress_feedback]  # 진행 중에는 긍정적 피드백만 표시

            print(f"hold_start={self.hold_start}, frame_idx={self.frame_idx}, side={side}")
            print(f"elapsed={elapsed}, min_hold={self.min_hold}")

            if elapsed >= self.min_hold:
                if self.counts[side] < self.target_count:
                    self.counts[side] += 1
                    result['counts'][side] = self.counts[side]

                
                if self.counts[side] >= self.target_count:
                    self.done_sides.add(side)

                    remaining_sides = [s for s in self.sides if s not in self.done_sides]
                    if remaining_sides:
                            result['feedback_messages'] = ["다른 방향으로 동작해주세요!"]
                    else:
                        result['completed'] = True
                        result['feedback_messages'] = ["완료! 잘하셨습니다!"]

        else:
            # 노이즈 방지를 위해 실패 시 윈도우·hold 초기화
            self.hold_start = None
            
            # 조건 불만족 시 피드백이 비어있다면 기본 메시지 추가
            if not result['feedback_messages']:
                result['feedback_messages'] = ["자세를 다시 확인해주세요."]

        result['feedback_type'] = self.categorize_feedback_type(
            result['feedback_messages'], 
            performing, 
            result['completed']
        )

        return result
    

    def categorize_feedback_type(self, feedback_messages, performing, completed):
        """피드백 메시지의 타입 분류"""
        if completed:
            return 'success'
        elif performing:
            return 'info'  # 진행 중
        elif feedback_messages:
            return 'warning'  # 피드백
        else:
            return 'error'  # 오류/경고


    def check_base_conditions_with_feedback(self, feat_df: pd.DataFrame) -> Tuple[np.ndarray, List[str]]:
        """기본 임계값 조건 확인 및 피드백 생성"""
        thresholds = self.cfg.get('thresholds', {})
        conditions = np.ones(len(feat_df), dtype=bool)
        feedback_messages = []
        
        for k, v in thresholds.items():
            if k == 'min_hold_duration_sec':
                continue
            
            # 새로운 형태 (값 + 메시지) 처리
            if isinstance(v, dict) and 'value' in v:
                threshold_value = v['value']
                feedback_message = v.get('message', f'{k} 조건을 만족하지 않습니다.')
            else:
                # 기존 형태 (값만) 처리
                threshold_value = v
                feedback_message = f'{k} 조건을 만족하지 않습니다.'
            
            # 특징 이름 추출
            if k.startswith('min_'):
                feat_name = k[4:]
                if feat_name in feat_df.columns:
                    condition = feat_df[feat_name] >= threshold_value
                    failed_indices = ~condition
                    
                    if failed_indices.any():
                        feedback_messages.append(feedback_message)
                        conditions &= condition
                        
            elif k.startswith('max_'):
                feat_name = k[4:]
                if feat_name in feat_df.columns:
                    condition = feat_df[feat_name] <= threshold_value
                    failed_indices = ~condition
                    
                    if failed_indices.any():
                        feedback_messages.append(feedback_message)
                        conditions &= condition

            elif k.startswith('abs_'):
                feat_name = k[4:]  # 'abs_' 제거
                if feat_name in feat_df.columns:
                    # 절댓값이 임계값을 넘어서야 함
                    condition = np.abs(feat_df[feat_name]) >= threshold_value
                    failed_indices = ~condition
                    
                    if failed_indices.any():
                        feedback_messages.append(feedback_message)
                        conditions &= condition
        
        return conditions, feedback_messages

    def check_directional_conditions_with_feedback(self, feat_df: pd.DataFrame, direction: str) -> Tuple[bool, List[str]]:
        """방향별 조건 확인 및 피드백 생성"""
        directional_thresholds = self.cfg.get('directional_thresholds', {})
        
        if direction not in directional_thresholds:
            return True, []
        
        direction_thresholds = directional_thresholds[direction]
        feedback_messages = []
        all_passed = True
        
        for k, v in direction_thresholds.items():
            # 새로운 형태 처리
            if isinstance(v, dict) and 'value' in v:
                threshold_value = v['value']
                feedback_message = v.get('message', f'{k} 조건을 만족하지 않습니다.')
            else:
                threshold_value = v
                feedback_message = f'{k} 조건을 만족하지 않습니다.'
            
            # 특징 이름 추출 및 검사
            if k.startswith('min_'):
                feat_name = k[4:]
                if feat_name in feat_df.columns:
                    feature_value = feat_df[feat_name].iloc[0]
                    if feature_value < threshold_value:
                        feedback_messages.append(feedback_message)
                        all_passed = False
                        
            elif k.startswith('max_'):
                feat_name = k[4:]
                if feat_name in feat_df.columns:
                    feature_value = feat_df[feat_name].iloc[0]
                    if feature_value > threshold_value:
                        feedback_messages.append(feedback_message)
                        all_passed = False
        
        return all_passed, feedback_messages