#!/usr/bin/env python3
import os
import yaml
import pandas as pd
import numpy as np
import math

from typing import List, Dict, Tuple


def load_config(path: str) -> Dict:
    """
    Load YAML configuration from the given path.
    """
    with open(path, encoding='utf-8') as f:
        return yaml.safe_load(f)


def compute_distance(a: np.ndarray, b: np.ndarray) -> np.ndarray:
    """
    Compute Euclidean distance between two sets of 2D points a and b.
    a, b: Nx2 numpy arrays.
    """
    return np.linalg.norm(a - b, axis=1)


def compute_angle_3d(a: np.ndarray, b: np.ndarray, c: np.ndarray) -> np.ndarray:
    """
    Compute the 3D angle at point b formed by points a-b-c.
    a, b, c: Nx3 numpy arrays of (x, y, z) coordinates.
    Returns angles in degrees.
    """
    ba = a - b
    bc = c - b
    dot = np.einsum('ij,ij->i', ba, bc)
    mag = np.linalg.norm(ba, axis=1) * np.linalg.norm(bc, axis=1) + 1e-8
    cosv = np.clip(dot / mag, -1.0, 1.0)
    return np.degrees(np.arccos(cosv))


def compute_head_pitch_proxy(df: pd.DataFrame, z_scale: float = 1.0) -> np.ndarray:
    """
    Compute head pitch proxy via Ear-Nose-Ear normal vector YZ angle.
    df: DataFrame containing 'x7','y7','z7','x8','y8','z8','x0','y0','z0'.
    z_scale: optional z-axis correction factor.
    Returns: numpy array of pitch proxy angles.
    """
    le = df[['x7','y7','z7']].to_numpy() * np.array([1, 1, z_scale])
    re = df[['x8','y8','z8']].to_numpy() * np.array([1, 1, z_scale])
    no = df[['x0','y0','z0']].to_numpy() * np.array([1, 1, z_scale])
    v1 = le - no
    v2 = re - no
    normals = np.cross(v1, v2)
    ny = normals[:,1]
    nz = normals[:,2]
    return np.degrees(np.arctan2(ny, nz))


def calculate_angle_2d(p1, p2, p3):
    """
    세 점으로 이루어진 각도를 2D 평면상에서 계산합니다.
    p2가 각의 꼭지점이 됩니다.
    
    Args:
        p1: 첫 번째 점 (x, y, z)
        p2: 각의 꼭지점 (x, y, z)
        p3: 세 번째 점 (x, y, z)
    
    Returns:
        float: 각도 (도)
    """
    # 벡터 계산 (x,y 좌표만 사용)
    v1 = np.array([p1[0] - p2[0], p1[1] - p2[1]])
    v2 = np.array([p3[0] - p2[0], p3[1] - p2[1]])
    
    # 벡터 정규화
    v1_norm = v1 / np.linalg.norm(v1)
    v2_norm = v2 / np.linalg.norm(v2)
    
    # 내적 계산
    dot_product = np.clip(np.dot(v1_norm, v2_norm), -1.0, 1.0)
    
    # 각도 계산 (라디안에서 도로 변환)
    angle = np.arccos(dot_product) * 180.0 / np.pi
    
    return angle


def extract_features(df: pd.DataFrame,
                     feature_defs: List[Dict],
                     calibration: Dict = None,
                     z_scale: float = 1.0) -> pd.DataFrame:
    """
    Extract features from filtered landmark DataFrame.
    feature_defs: list of {name,type,points} dicts.
    calibration: optional baseline values for delta features.
    z_scale: z-axis scaling factor if calibration.z_scale missing.
    """
    # Determine z-scale
    if calibration and 'z_scale' in calibration:
        scale = calibration['z_scale']
    else:
        scale = z_scale

    feats: Dict[str, np.ndarray] = {}
    for f in feature_defs:
        nm = f['name']
        pts = f['points']
        ft = f['type']
        direction = f.get('direction')  # YAML의 direction 설정 가져오기

        if ft == 'distance' and len(pts) == 2:
            a = df[[f'x{pts[0]}', f'y{pts[0]}']].to_numpy()
            b = df[[f'x{pts[1]}', f'y{pts[1]}']].to_numpy()
            feats[nm] = compute_distance(a, b)

        # elif ft == 'angle' and len(pts) == 3:
        #     a3 = df[[f'x{pts[0]}', f'y{pts[0]}', f'z{pts[0]}']].to_numpy()
        #     b3 = df[[f'x{pts[1]}', f'y{pts[1]}', f'z{pts[1]}']].to_numpy()
        #     c3 = df[[f'x{pts[2]}', f'y{pts[2]}', f'z{pts[2]}']].to_numpy()
        #     a3[:,2] *= scale
        #     b3[:,2] *= scale
        #     c3[:,2] *= scale
        #     feats[nm] = compute_angle_3d(a3, b3, c3)

        elif ft == 'coordinate_x' and len(pts) == 1:
            feats[nm] = df[f'x{pts[0]}'].to_numpy()

        elif ft == 'coordinate_y' and len(pts) == 1:
            feats[nm] = df[f'y{pts[0]}'].to_numpy()

        elif ft == 'coordinate_z' and len(pts) == 1:
            feats[nm] = df[f'z{pts[0]}'].to_numpy() * scale

        elif ft == 'delta_y' and len(pts) == 2:
            y1 = df[f'y{pts[0]}'].to_numpy()
            y2 = df[f'y{pts[1]}'].to_numpy()
            feats[nm] = y1 - y2

        elif ft == 'normal_vector_pitch':
            feats[nm] = compute_head_pitch_proxy(df, scale)

        elif ft == 'angle':
            # 각도 계산
            p1 = df[[f'x{pts[0]}', f'y{pts[0]}', f'z{pts[0]}']].values
            p2 = df[[f'x{pts[1]}', f'y{pts[1]}', f'z{pts[1]}']].values
            p3 = df[[f'x{pts[2]}', f'y{pts[2]}', f'z{pts[2]}']].values
            
            angles = []
            for i in range(len(df)):
                angle = calculate_angle_2d(p1[i], p2[i], p3[i])
                angles.append(angle)
            
            feats[nm] = angles

        else:
            raise ValueError(f"Unknown feature type or wrong definition: {f}")

    # Add delta_ features
    if calibration:
        for key, base in calibration.items():
            if key in feats:
                feats[f'delta_{key}'] = np.abs(feats[key] - base)

    return pd.DataFrame(feats)


def segment_reps_by_peaks(arr: np.ndarray, cfg: Dict, fps: int = 30) -> List[Tuple[int,int]]:
    """
    Detect rep cycles as peak→trough→peak or trough→peak→trough in 1D signal.
    Uses min_swing to filter small fluctuations.
    
    Args:
        arr: 1D signal array
        cfg: configuration dictionary containing:
            - min_swing: minimum amplitude for valid peaks/troughs
            - max_angle: maximum angle threshold (for inner angles)
            - method: 'peaks' or 'troughs' based detection
        fps: frames per second
    
    Returns:
        List of (start, end) frame indices for each rep cycle
    """
    min_swing = cfg.get('min_swing', 0)
    max_angle = cfg.get('thresholds', {}).get('max_rotation_angle', 180)  # thresholds 섹션에서 가져오기
    
    peaks, troughs = [], []
    for i in range(1, len(arr)-1):
        prev, curr, nxt = arr[i-1], arr[i], arr[i+1]
        
        # 내각이 max_angle 이하일 때만 유효한 피크/트로프로 판단
        if curr <= max_angle:
            if curr > prev and curr > nxt and (curr - max(prev, nxt)) >= min_swing:
                peaks.append(i)
            if curr < prev and curr < nxt and (min(prev, nxt) - curr) >= min_swing:
                troughs.append(i)
    
    events = sorted(peaks + troughs)
    segs: List[Tuple[int,int]] = []
    
    # 최소 유지 시간 계산
    min_hold_back_frames = int(cfg.get('min_hold_back_sec', 0.3) * fps)
    min_hold_forward_frames = int(cfg.get('min_hold_forward_sec', 0.3) * fps)
    
    for i in range(len(events)-2):
        a, b, c = events[i], events[i+1], events[i+2]
        
        # 피크-트로프-피크 또는 트로프-피크-트로프 패턴 확인
        if (a in peaks and b in troughs and c in peaks) or (a in troughs and b in peaks and c in troughs):
            # 각 상태의 유지 시간 확인
            back_duration = b - a
            forward_duration = c - b
            
            # 최소 유지 시간 조건 만족 시에만 세그먼트 추가
            if back_duration >= min_hold_back_frames and forward_duration >= min_hold_forward_frames:
                segs.append((a, c))
    
    return segs


def segment_reps(feat_df: pd.DataFrame, cfg: Dict, fps: int = 30):
    """
    Use peaks-based segmentation for rep exercises.
    Now considers max_rotation_angle for inner angles.
    """
    cycles = cfg.get('cycles', {})
    arr = feat_df[cycles['feature']].values
    return segment_reps_by_peaks(arr, cycles, fps)


def segment_holds(feat_df: pd.DataFrame, cfg: Dict, fps: int = 30):
    """
    Find hold segments based on threshold conditions.
    If direction is specified in config, returns segments by direction.
    
    Args:
        feat_df: DataFrame containing extracted features
        cfg: Configuration dictionary containing thresholds and optional direction logic
        fps: Frames per second
    
    Returns:
        If direction specified: Dictionary of direction -> segments
        Otherwise: List of (start, end) frame indices
    """
    thr = cfg.get('thresholds', {})
    min_duration = int(thr.get('min_hold_duration_sec', 1) * fps)
    
    # 기본 임계값 조건 검사 (방향 판단과 무관한 기본 자세 조건)
    base_conditions = np.ones(len(feat_df), dtype=bool)
    for k, v in thr.items():
        if k == 'min_hold_duration_sec':
            continue
            
        # 특징 이름 추출
        if k.startswith('min_'):
            feat_name = k[4:]  # 'min_' 제거
            if feat_name in feat_df.columns:
                condition = feat_df[feat_name] >= v
                base_conditions &= condition
                print(f"Base condition {feat_name} >= {v}: {condition.sum()} frames satisfied")
        elif k.startswith('max_'):
            feat_name = k[4:]  # 'max_' 제거
            if feat_name in feat_df.columns:
                condition = feat_df[feat_name] <= v
                base_conditions &= condition
                print(f"Base condition {feat_name} <= {v}: {condition.sum()} frames satisfied")
    
    print(f"Total frames satisfying all base conditions: {base_conditions.sum()}")
    
    # 방향 판단이 필요한 경우
    if 'direction' in cfg:
        direction_cfg = cfg['direction']
        segments_by_direction = {}
        
        # 각 방향별 조건 생성
        for direction, conditions in direction_cfg.items():
            # 방향 판단은 베이스 컨디션과 독립적으로 수행
            direction_mask = np.ones(len(feat_df), dtype=bool)
            
            for feat_name, condition_cfg in conditions.items():
                if feat_name in feat_df.columns:
                    sign = condition_cfg['sign']
                    threshold = condition_cfg['threshold']
                    
                    if sign == 'positive':
                        condition = feat_df[feat_name] > threshold
                        direction_mask &= condition
                        print(f"Direction {direction} condition {feat_name} > {threshold}: {condition.sum()} frames satisfied")
                    elif sign == 'negative':
                        condition = feat_df[feat_name] < -threshold
                        direction_mask &= condition
                        print(f"Direction {direction} condition {feat_name} < -{threshold}: {condition.sum()} frames satisfied")
            
            print(f"Direction {direction} total frames satisfying all conditions: {direction_mask.sum()}")
            
            # 연속된 구간 찾기
            segments = find_continuous_segments(direction_mask, min_duration)
            if segments:
                segments_by_direction[direction] = segments
                print(f"Found {len(segments)} segments for direction {direction}")
            else:
                print(f"No segments found for direction {direction}")
        
        return segments_by_direction
    
    # 방향 판단이 필요 없는 경우
    return find_continuous_segments(base_conditions, min_duration)

def find_continuous_segments(mask: np.ndarray, min_duration: int) -> List[Tuple[int, int]]:
    """
    Find continuous segments in a boolean mask that are longer than min_duration.
    
    Args:
        mask: Boolean array indicating valid frames
        min_duration: Minimum duration in frames
    
    Returns:
        List of (start, end) frame indices for each segment
    """
    segments = []
    start = None
    
    for i, m in enumerate(mask):
        if m and start is None:
            start = i
        elif not m and start is not None:
            if i - start >= min_duration:
                segments.append((start, i))
            start = None
    
    if start is not None and len(mask) - start >= min_duration:
        segments.append((start, len(mask)))
    
    return segments
