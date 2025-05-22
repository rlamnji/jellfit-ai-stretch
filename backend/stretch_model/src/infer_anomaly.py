import os
import yaml
import cv2
import numpy as np
import mediapipe as mp
import joblib
from typing import Dict, List
from mediapipe.python.solutions.pose import PoseLandmark
from collections import deque
import csv
import math
from pathlib import Path
import pandas as pd


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
        self.min_hold = self.cfg['thresholds']['min_hold_duration_sec'] # 최소 유지 시간
        self.target_count = self.cfg['cycles']['count'] # 목표 반복 횟수
        self.required_window = self.cfg.get('model', {}).get('window_size', 10) # 필요한 윈도우 크기 (모델에 따라 다름, 기본값 10)

        # 상태 변수
        self.current_side = None # 현재 수행 중인 방향 (left/right/None)
        self.frame_idx = 0 # 현재 프레임 인덱스
        self.hold_start = None # hold 시작 프레임 인덱스
        self.counts = {'left': 0, 'right': 0} # 각 방향별 수행 횟수
        self.feature_buffer = deque(maxlen=self.required_window) # 특징 버퍼 (윈도우 크기만큼 저장) -> 추후 정확도 올릴 때 사용함

        # 모델 로딩
        model_dir = base_dir / "models" # 모델 경로
        self.models = {}
        # 각 방향별 모델과 스케일러 로딩 -> 사용할지 안할지 모르겠음음
        for side in ['left', 'right']:
            m_path = model_dir / f"{exercise}_{side}_anomaly.joblib"
            s_path = model_dir / f"{exercise}_{side}_scaler.joblib"
            if m_path.exists() and s_path.exists():
                self.models[side] = {
                    "model": joblib.load(m_path),
                    "scaler": joblib.load(s_path),
                }
            else:
                print(f"Warning: 모델/스케일러 누락 – {side}: {m_path.name}, {s_path.name}")

        # MediaPipe Pose 초기화
        self.pose = mp.solutions.pose.Pose(static_image_mode=False)

        # direction 설정
        self.direction_cfg = self.cfg['direction']

        # 상체 랜드마크 인덱스
        self.UPPER_BODY_LANDMARKS = list(range(23))  # 0~22

        # 피처 계산 준비
        self.feature_names = [f['name'] for f in self.cfg['features']]
        self.feature_calculators = []
        for feature in self.cfg['features']:
            typ, pts = feature['type'], feature['points']
            if typ == 'distance':
                self.feature_calculators.append(
                lambda lm, p=pts: self.compute_distance(lm[p[0]], lm[p[1]])
            )
            elif typ == 'angle':
                self.feature_calculators.append(
                lambda lm, p=pts: self.compute_angle(lm[p[0]], lm[p[1]], lm[p[2]])
            ) 
            elif typ == 'delta_y':
                self.feature_calculators.append(
                lambda lm, p=pts: lm[p[0]][1] - lm[p[1]][1]
            )

        # 추적 결과 저장
        self.landmark_history = []

    def compute_distance(self, p1, p2):
        """
        두 점 p1, p2 사이의 유클리드 거리(Euclidean distance)를 계산.
        - p1, p2: (x, y) 형태의 좌표 튜플
            예: p1 = (0.3, 0.5), p2 = (0.6, 0.1)
        - 반환값: sqrt((x1−x2)^2 + (y1−y2)^2)
        """
        return math.sqrt((p1[0] - p2[0]) ** 2 + (p1[1] - p2[1]) ** 2)

    def compute_angle(self, a, b, c):
        """
        점 a–b–c가 이루는 각도를 b 지점을 꼭짓점(vertex)으로 계산.
        1) 벡터 AB = a − b,  벡터 CB = c − b
        2) dot = AB·CB,  norm_AB = |AB|, norm_CB = |CB|
        3) cosθ = dot / (|AB|·|CB|)
        4) θ(rad) = arccos(clamp(cosθ, −1, +1)),  θ(°) = degrees(θ)
        - a, b, c: (x, y) 튜플
            예: a=(0.2,0.4), b=(0.3,0.6), c=(0.5,0.8)
        - 반환값: 각도(degree 단위)
        """
        ab = (a[0] - b[0], a[1] - b[1])
        cb = (c[0] - b[0], c[1] - b[1])
        dot = ab[0] * cb[0] + ab[1] * cb[1]
        norm_ab = math.sqrt(ab[0]**2 + ab[1]**2)
        norm_cb = math.sqrt(cb[0]**2 + cb[1]**2)
        cos_theta = dot / (norm_ab * norm_cb + 1e-6)
        angle_rad = math.acos(np.clip(cos_theta, -1.0, 1.0))
        return math.degrees(angle_rad)


    def euclidean(self, p1, p2):
        return np.linalg.norm(np.array(p1) - np.array(p2))

    def angle_between(self, p1, p2, p3):
        ba = np.array(p1) - np.array(p2)
        bc = np.array(p3) - np.array(p2)
        cos_angle = np.dot(ba, bc) / (np.linalg.norm(ba) * np.linalg.norm(bc) + 1e-6)
        return np.degrees(np.arccos(np.clip(cos_angle, -1.0, 1.0)))

    def extract_landmarks(self, image: np.ndarray) -> Dict[str, float] | None:
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
            return None

        # landmarks dict 만들기: { index: (x, y, z) }
        lm = {
            idx: (pt.x, pt.y, pt.z)
            for idx, pt in enumerate(result.pose_landmarks.landmark)
            if idx in self.UPPER_BODY_LANDMARKS
        }

        # init에 생성한 
        feats: Dict[str, float] = {}
        for name, func in zip(self.feature_names, self.feature_calculators):
            feats[name] = func(lm)

        return feats

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

    def is_performing(self, image: np.ndarray) -> Dict:
        self.frame_idx += 1
        feats = self.extract_landmarks(image)

        result = {
            'exercise': self.exercise,
            'current_side': self.current_side,
            'elapsed_time': 0.0,
            'counts': dict(self.counts),
            'completed': False
        }
        if feats is None:
            return result

        # 1) 방향 결정
        side = self.detect_direction(feats)
        result['current_side'] = side

        # 2) feature_buffer에 벡터 추가
        if side:
            vec = np.array([feats[n] for n in self.feature_names])
            self.feature_buffer.append(vec)
        else:
            self.feature_buffer.clear()
            self.hold_start = None
        
        # 3) 모델 예측 (윈도우가 찼을 때만)
        performing = False
        if side and len(self.feature_buffer) == self.required_window:
            X_win = np.stack(self.feature_buffer, axis=0)
            X_win_df = pd.DataFrame(X_win, columns=self.feature_names)
            scaler = self.models[side]['scaler'] 
            model  = self.models[side]['model']
            X_scaled = scaler.transform(X_win_df)
            try:
                scores = model.decision_function(X_scaled)
                print("Anomaly scores:", scores)
            except AttributeError:
                # decision_function이 없으면 무시
                pass
            preds = model.predict(X_scaled)

            # 3) “–0.2 이상”을 정상(inlier)으로 판정
            if scores is not None:
                # scores >= -0.2이면 True(정상), else False(이상)
                inliers = scores >= -0.2
                vote_ratio = inliers.mean()
                print("Inlier flags:", inliers.astype(int))
                # print(f"Vote ratio based on –0.2 threshold: {vote_ratio:.2f}")
            else:
                # decision_function이 없으면 기존 preds 기반으로 fallback
                preds = model.predict(X_scaled)
                inliers = (preds == 1)
                vote_ratio = inliers.mean()
                # print(f"Predictions: {preds}")

            vote_thr = self.cfg.get('model', {}).get('vote_threshold', 0.6) # 우선 임의로 10개 중 6개가 정상이면 들어오게끔 설정, 추후 yaml 수정
            # performing = (preds == 1).mean() >= vote_thr
            performing = vote_ratio >= vote_thr
            # print(f"Predictions: {preds}, Performing: {performing}")

        # 4) performing 이 True일 때만 hold 로직
        if performing:
            if self.current_side != side:
                self.current_side = side
                try:
                    first_true_idx = np.argmax(inliers)
                    self.hold_start = self.frame_idx - self.required_window + 1 + first_true_idx
                except:
                    self.hold_start = self.frame_idx  # fallback


            elapsed = (self.frame_idx - self.hold_start) * (self.frame_interval_ms / 100) # 동작이 진행된 프레임 수 * 초당 프레임 수
            result['elapsed_time'] = elapsed

            # 테스트
            print(f"hold_start={self.hold_start}, frame_idx={self.frame_idx}, side={side}")
            print(f"elapsed={elapsed}, min_hold={self.min_hold}")

            if elapsed >= self.min_hold:
                self.counts[side] += 1
                result['counts'][side] = self.counts[side]

                if self.counts[side] >= self.target_count:
                    result['completed'] = True

                # 완료 후 reset
                self.current_side = None
                self.hold_start = None
                self.feature_buffer.clear()
        else:
            # 노이즈 방지를 위해 실패 시 윈도우·hold 초기화
            self.hold_start = None

        return result
