#!/usr/bin/env python3
import yaml
from typing import Dict

class StretchTracker:
    """
    실시간 스트레칭 추적기: 프레임 단위로 스트레칭 수행 여부, 지속 시간, 시행 횟수 검사
    """
    def __init__(self, exercise: str, fps: int = 30):
        # 1. 설정 로드
        cfg_path = f'config/{exercise}.yaml'
        with open(cfg_path, encoding='utf-8') as f:
            self.cfg = yaml.safe_load(f)
        self.exercise = exercise
        self.fps = fps
        # thresholds & target count
        self.min_hold = self.cfg['thresholds']['min_hold_duration_sec']
        self.target_count = self.cfg['cycles']['count']
        # direction 로직
        self.direction_cfg = self.cfg.get('direction', {})
        # 상태 변수 초기화
        self.current_side = None      # 'left' or 'right'
        self.frame_idx = 0            # 누적 프레임
        self.hold_start = None        # 현재 유지 시작 프레임
        self.counts = { 'left': 0, 'right': 0 }

    def extract_landmarks(self, frame: Dict) -> Dict[str, float]:
        return 0

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

    def is_performing(self, frame: Dict) -> Dict:
        """
        한 프레임 단위로 호출:
         - direction 판단
         - hold 상태 지속 시간 누적
         - count 업데이트
        returns:
         {
           'exercise': ..., 'current_side': ...,
           'elapsed_time': seconds, 'counts': {'left':int,'right':int},
           'completed': True/False
         }
        """
        self.frame_idx += 1
        feats = self.extract_landmarks(frame)
        side = self.detect_direction(feats)

        result = {
            'exercise': self.exercise,
            'current_side': self.current_side,
            'elapsed_time': 0.0,
            'counts': dict(self.counts),
            'completed': False
        }

        if side:
            # 새 사이드 시작
            if self.current_side is None:
                self.current_side = side
                self.hold_start = self.frame_idx

            # 같은 방향 유지 중
            if side == self.current_side:
                elapsed = (self.frame_idx - self.hold_start) / self.fps
                result['elapsed_time'] = elapsed
                # 최소 유지시간 충족 시 1회 카운트
                if elapsed >= self.min_hold:
                    self.counts[side] += 1
                    result['counts'][side] = self.counts[side]
                    # 완료 여부
                    if self.counts[side] >= self.target_count:
                        result['completed'] = True
                    # 상태 초기화: 다음 프레임부터 새로운 시행 대기
                    self.current_side = None
                    self.hold_start = None
        else:
            # 방향 불명 또는 풀림 상태
            self.hold_start = None
            # current_side는 유지(다른 쪽 시작 전까지)

        return result
