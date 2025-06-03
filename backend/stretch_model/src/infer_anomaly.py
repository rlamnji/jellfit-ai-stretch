import yaml
import cv2
import numpy as np
import mediapipe as mp
from typing import Dict, List, Tuple
from collections import deque
from pathlib import Path
import pandas as pd
from utils import extract_features
import time


class ThresholdStretchTracker:
    """
    임계값 기반 실시간 스트레칭 추적기
    - 모델 대신 임계값 조건만으로 자세 판단
    - 노이즈 필터링 제거
    """

    def __init__(self, exercise: str, frame_interval_ms: int = 30, user_id: str = None):
        base_dir = Path(__file__).resolve().parent.parent

        # config 로드
        cfg_path = base_dir / "config" / f"{exercise}.yaml"
        with cfg_path.open(encoding="utf-8") as f:
            self.cfg = yaml.safe_load(f)
        
        self.exercise = exercise
        self.frame_interval_ms = frame_interval_ms
        self.user_id = user_id

        # threshold
        self.min_hold = self.cfg['thresholds']['min_hold_duration_sec']
        self.target_count = self.cfg['cycles']['count']

        # 상태 변수
        self.current_side = None
        self.frame_idx = 0
        self.hold_start_time = None
        self.counts = {}
        
        # 방향을 가지는 동작인지 판단
        self.has_direction = 'direction' in self.cfg and self.cfg['direction']
        self.sides = list(self.cfg['direction'].keys()) if self.has_direction else [None]
        self.done_sides = set()
        
        # 각 방향별 counts 초기화
        for side in self.sides:
            self.counts[side] = 0

        # MediaPipe Pose 초기화
        self.pose = mp.solutions.pose.Pose(static_image_mode=False)

        # direction 설정
        self.direction_cfg = self.cfg.get('direction', {})

        # config 이용해서 feature 정의
        self.feature_defs = self.cfg['features']

        # 캘리브레이션 로드 (사용자 ID가 있는 경우)
        if self.user_id:
            from utils import load_user_calibration, load_user_calibration_from_csv
            self.calibration = load_user_calibration(self.user_id)
            if not self.calibration:
                self.calibration = load_user_calibration_from_csv(self.user_id)
        else:
            self.calibration = self.cfg.get('calibration', {})
        
        self.z_scale = self.cfg.get('model', {}).get('z_scale', 1.0)

    def extract_landmarks(self, image: np.ndarray) -> Dict[str, float] | None:
        """
        한 프레임에서 상체 랜드마크를 뽑아 config에 정의된 feature를 계산
        """
        image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        result = self.pose.process(image_rgb)
        
        if not result.pose_landmarks:
            return None

        # landmarks dict 만들기
        allowed = set(self.cfg.get('landmarks', []))
        lm = {
            idx: (pt.x, pt.y, pt.z)
            for idx, pt in enumerate(result.pose_landmarks.landmark)
            if idx in allowed
        }

        # landmarks를 DataFrame으로 변환
        row = {}
        for idx, coords in lm.items():
            row[f'x{idx}'], row[f'y{idx}'], row[f'z{idx}'] = coords
        df = pd.DataFrame([row])

        feat_df = extract_features(
            df,
            self.feature_defs,
            calibration=self.calibration,
            z_scale=self.z_scale
        )

        return feat_df.iloc[0].astype(float).to_dict()

    def detect_direction(self, feats: Dict[str, float]) -> str:
        """방향 판단: left/right/None"""
        for side, rules in self.direction_cfg.items():
            ok = True
            for feat, cond in rules.items():
                val = feats.get(feat, 0)
                thr = cond.get('threshold', 0)
                if cond.get('sign') == 'positive' and val < thr:
                    ok = False; break
                if cond.get('sign') == 'negative' and val > -thr:
                    ok = False; break
                if cond.get('sign') == 'interval' and not (-thr < val < thr):
                    ok = False; break
            if ok:
                return side
        return None

    def check_basic_conditions(self, feat_df: pd.DataFrame, side: str = None) -> bool:
        """기본 임계값 조건들을 확인 (캘리브레이션 우선순위 적용)"""
        thresholds = self.cfg.get('thresholds', {})
        
        # 캘리브레이션 기반 임계값들을 먼저 수집
        calibration_thresholds = set()
        for k in thresholds.keys():
            if k.startswith('calibration_'):
                # feature 이름 추출
                feat_name = k.replace('calibration_min_', '').replace('calibration_max_', '')
                calibration_thresholds.add(feat_name)
        
        print(f"Features with calibration thresholds: {calibration_thresholds}")
        
        # 기본 조건 확인
        for k, v in thresholds.items():
            if k in ['min_hold_duration_sec']:
                continue
            
            # 캘리브레이션 기반 임계값 처리
            if k.startswith('calibration_') and self.calibration:
                if not isinstance(v, dict):
                    continue
                    
                calibration_key = v.get('calibration_key')
                operator = v.get('operator', 'greater_than')
                offset = v.get('offset', 0.0)
                
                if calibration_key not in self.calibration:
                    continue
                
                baseline_value = self.calibration[calibration_key]
                threshold_value = baseline_value + offset
                feat_name = k.replace('calibration_min_', '').replace('calibration_max_', '')
                
                if feat_name in feat_df.columns:
                    current_value = feat_df[feat_name].iloc[0]
                    
                    if operator == 'greater_than' and current_value <= threshold_value:
                        print(f"[CALIB] {feat_name} > {threshold_value:.4f}: FAIL ({current_value:.4f})")
                        return False
                    elif operator == 'greater_equal' and current_value < threshold_value:
                        print(f"[CALIB] {feat_name} >= {threshold_value:.4f}: FAIL ({current_value:.4f})")
                        return False
                    elif operator == 'less_than' and current_value >= threshold_value:
                        print(f"[CALIB] {feat_name} < {threshold_value:.4f}: FAIL ({current_value:.4f})")
                        return False
                    elif operator == 'less_equal' and current_value > threshold_value:
                        print(f"[CALIB] {feat_name} <= {threshold_value:.4f}: FAIL ({current_value:.4f})")
                        return False
                    
                    print(f"[CALIB] {feat_name} {operator} {threshold_value:.4f}: PASS ({current_value:.4f})")
                
                continue
            
            # 일반 임계값 처리 (캘리브레이션 버전이 없는 경우에만)
            if isinstance(v, dict) and 'value' in v:
                threshold_value = v['value']
            else:
                threshold_value = v
            
            # 특징 이름 추출
            feat_name = None
            if k.startswith('min_'):
                feat_name = k[4:]
            elif k.startswith('max_'):
                feat_name = k[4:]
            elif k.startswith('abs_'):
                feat_name = k[4:]
            
            # 캘리브레이션 버전이 있는지 확인
            if feat_name and feat_name in calibration_thresholds:
                print(f"[SKIP] Skipping {k} - calibration version exists for {feat_name}")
                continue
            
            # 조건 확인
            if k.startswith('min_'):
                if feat_name in feat_df.columns:
                    current_value = feat_df[feat_name].iloc[0]
                    if current_value < threshold_value:
                        print(f"[FIXED] {feat_name} >= {threshold_value}: FAIL ({current_value:.4f})")
                        return False
                    print(f"[FIXED] {feat_name} >= {threshold_value}: PASS ({current_value:.4f})")
                        
            elif k.startswith('max_'):
                if feat_name in feat_df.columns:
                    current_value = feat_df[feat_name].iloc[0]
                    if current_value > threshold_value:
                        print(f"[FIXED] {feat_name} <= {threshold_value}: FAIL ({current_value:.4f})")
                        return False
                    print(f"[FIXED] {feat_name} <= {threshold_value}: PASS ({current_value:.4f})")
            
            elif k.startswith('abs_'):
                if feat_name in feat_df.columns:
                    current_value = feat_df[feat_name].iloc[0]
                    if abs(current_value) < threshold_value:
                        print(f"[FIXED] |{feat_name}| >= {threshold_value}: FAIL ({abs(current_value):.4f})")
                        return False
                    print(f"[FIXED] |{feat_name}| >= {threshold_value}: PASS ({abs(current_value):.4f})")
        
        # 방향별 조건 확인 (있는 경우)
        if side and 'direction' in self.cfg and side in self.cfg['direction']:
            direction_conditions = self.cfg['direction'][side]
            for feat_name, condition_cfg in direction_conditions.items():
                if feat_name in feat_df.columns:
                    sign = condition_cfg['sign']
                    threshold = condition_cfg['threshold']
                    value = feat_df[feat_name].iloc[0]
                    
                    if sign == 'positive' and value <= threshold:
                        print(f"[DIR] {feat_name} > {threshold}: FAIL ({value:.4f})")
                        return False
                    elif sign == 'negative' and value >= -threshold:
                        print(f"[DIR] {feat_name} < {-threshold}: FAIL ({value:.4f})")
                        return False
                    elif sign == 'interval' and not (-threshold < value < threshold):
                        print(f"[DIR] {-threshold} < {feat_name} < {threshold}: FAIL ({value:.4f})")
                        return False
                    
                    print(f"[DIR] {feat_name} {sign} {threshold}: PASS ({value:.4f})")
        
        return True

    def generate_threshold_feedback(self, feat_df: pd.DataFrame, side: str = None) -> List[str]:
        """임계값 기반 피드백 생성 (캘리브레이션 우선순위 적용)"""
        feedback_messages = []
        thresholds = self.cfg.get('thresholds', {})
        
        # 캘리브레이션 기반 임계값들을 먼저 수집
        calibration_thresholds = set()
        for k in thresholds.keys():
            if k.startswith('calibration_'):
                feat_name = k.replace('calibration_min_', '').replace('calibration_max_', '')
                calibration_thresholds.add(feat_name)
        
        for k, v in thresholds.items():
            if k in ['min_hold_duration_sec']:
                continue
            
            # 캘리브레이션 기반 임계값 피드백
            if k.startswith('calibration_') and self.calibration:
                if not isinstance(v, dict):
                    continue
                    
                calibration_key = v.get('calibration_key')
                operator = v.get('operator', 'greater_than')
                offset = v.get('offset', 0.0)
                message = v.get('message', f'{k} 조건을 만족하지 않습니다.')
                
                if calibration_key not in self.calibration:
                    continue
                
                baseline_value = self.calibration[calibration_key]
                threshold_value = baseline_value + offset
                feat_name = k.replace('calibration_min_', '').replace('calibration_max_', '')
                
                if feat_name in feat_df.columns:
                    current_value = feat_df[feat_name].iloc[0]
                    
                    failed = False
                    if operator == 'greater_than' and current_value <= threshold_value:
                        failed = True
                    elif operator == 'greater_equal' and current_value < threshold_value:
                        failed = True
                    elif operator == 'less_than' and current_value >= threshold_value:
                        failed = True
                    elif operator == 'less_equal' and current_value > threshold_value:
                        failed = True
                    
                    if failed:
                        feedback_messages.append(message)
                
                continue
            
            # 일반 임계값 피드백 (캘리브레이션 버전이 없는 경우에만)
            message = None
            if isinstance(v, dict) and 'message' in v:
                message = v['message']
                threshold_value = v['value']
            else:
                threshold_value = v
            
            # 특징 이름 추출
            feat_name = None
            if k.startswith('min_'):
                feat_name = k[4:]
            elif k.startswith('max_'):
                feat_name = k[4:]
            elif k.startswith('abs_'):
                feat_name = k[4:]
            
            # 캘리브레이션 버전이 있는지 확인
            if feat_name and feat_name in calibration_thresholds:
                continue  # 캘리브레이션 버전이 있으므로 건너뛰기
            
            # 조건 확인 및 피드백 생성
            if k.startswith('min_'):
                if feat_name in feat_df.columns:
                    if feat_df[feat_name].iloc[0] < threshold_value:
                        if message:
                            feedback_messages.append(message)
                            
            elif k.startswith('max_'):
                if feat_name in feat_df.columns:
                    if feat_df[feat_name].iloc[0] > threshold_value:
                        if message:
                            feedback_messages.append(message)
            
            elif k.startswith('abs_'):
                if feat_name in feat_df.columns:
                    if abs(feat_df[feat_name].iloc[0]) < threshold_value:
                        if message:
                            feedback_messages.append(message)
        
        return feedback_messages if feedback_messages else ["자세를 확인해주세요."]

    def is_performing(self, image: np.ndarray) -> Dict:
        self.frame_idx += 1
        current_time = time.time()
        
        feats = self.extract_landmarks(image)

        result = {
            'exercise': self.exercise,
            'current_side': self.current_side,
            'elapsed_time': 0.0,
            'counts': dict(self.counts),
            'completed': False,
            'feedback_messages': [],
            'feedback_type': 'error'
        }
        
        if feats is None:
            result['feedback_messages'] = ["포즈를 감지할 수 없습니다. 카메라 앞에 서주세요."]
            return result

        # DataFrame으로 변환
        df = pd.DataFrame([feats])
        feat_df = extract_features(df, self.cfg['features'])

        # 1) 방향 결정
        side = self.detect_direction(feats)
        result['current_side'] = side

        if side is None and self.has_direction:
            result['feedback_messages'] = ["올바른 자세를 취해주세요."]
            return result

        # 2) 기본 조건 확인 (임계값만 사용, 필터링 없음)
        condition_met = self.check_basic_conditions(feat_df, side)
        
        # 3) 피드백 생성
        if not condition_met:
            result['feedback_messages'] = self.generate_threshold_feedback(feat_df, side)
        
        # 4) hold 시간 누적 (조건이 맞을 때만)
        if condition_met:
            if self.current_side != side or self.hold_start_time is None:
                self.current_side = side
                self.hold_start_time = current_time

            elapsed = current_time - self.hold_start_time
            result['elapsed_time'] = elapsed

            # 진행률 피드백
            if elapsed < self.min_hold:
                progress_feedback = f"좋습니다! {elapsed:.1f}초/{self.min_hold}초 진행 중입니다."
                result['feedback_messages'] = [progress_feedback]

            if elapsed >= self.min_hold:
                if self.counts[side] < self.target_count:
                    self.counts[side] += 1
                    result['counts'][side] = self.counts[side]

                    # 해당 방향 완료 체크
                    if self.counts[side] >= self.target_count:
                        self.done_sides.add(side)

                        # 아직 다른 방향 남아 있음
                        remaining_sides = [s for s in self.sides if s not in self.done_sides]
                        if remaining_sides:
                            result['feedback_messages'] = ["다른 방향으로 동작해주세요!"]
                        else:
                            result['completed'] = True
                            result['feedback_messages'] = ["완료! 잘하셨습니다!"]

                # 완료 후 reset
                self.current_side = None
                self.hold_start_time = None
                    
        else:
            # 자세가 틀렸을 때는 시간 초기화
            self.hold_start_time = None
            
            if not result['feedback_messages']:
                result['feedback_messages'] = ["자세를 다시 확인해주세요."]

        result['feedback_type'] = self.categorize_feedback_type(
            result['feedback_messages'], 
            condition_met, 
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

    def reset_session(self):
        """세션 초기화"""
        self.current_side = None
        self.frame_idx = 0
        self.hold_start_time = None
        self.counts = {side: 0 for side in self.sides}
        self.done_sides = set()