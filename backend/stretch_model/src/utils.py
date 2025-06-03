#!/usr/bin/env python3
import os
import yaml
import pandas as pd
import numpy as np
import math
import sqlite3
import json
from pathlib import Path

from typing import List, Dict, Tuple

from app.services.calibration_service import get_user_calibration_features, save_user_calibration
from db.database import get_db


def load_user_calibration(user_id: str) -> Dict:
    """
    데이터베이스에서 사용자 캘리브레이션 데이터 로드
    
    Args:
        user_id: 사용자 ID
        
    Returns:
        캘리브레이션 특징값들의 딕셔너리
    """
    db = next(get_db())
    calib_dict = get_user_calibration_features(user_id=int(user_id), db=db) # {name: value} 형태

    if not calib_dict:
        raise ValueError(f"❌ user_id={user_id}에 대한 캘리브레이션 데이터가 없습니다.")
    
    return calib_dict


def load_user_calibration_from_csv(user_id: str) -> Dict:
    """
    CSV 파일에서 사용자 캘리브레이션 데이터 로드 (백업/테스트용)
    
    Args:
        user_id: 사용자 ID
        
    Returns:
        캘리브레이션 특징값들의 딕셔너리
    """
    try:
        # CSV 파일 경로
        csv_path = Path("data") / "calibration" / f"calibration_features_{user_id}.csv"
        
        if not csv_path.exists():
            print(f"Warning: Calibration CSV not found at {csv_path}")
            return {}
        
        df = pd.read_csv(csv_path)
        
        if len(df) == 0:
            print(f"Empty calibration CSV for user {user_id}")
            return {}
        
        # 최신 데이터 사용 (마지막 행)
        latest_row = df.iloc[-1]
        
        # user_id, timestamp 컬럼 제외하고 특징값만 추출
        exclude_cols = ['user_id', 'timestamp']
        features = {}
        
        for col in df.columns:
            if col not in exclude_cols:
                features[col] = latest_row[col]
        
        print(f"Loaded calibration from CSV for user {user_id}")
        for key, value in features.items():
            if isinstance(value, (int, float)):
                print(f"  {key}: {value:.6f}")
        
        return features
        
    except Exception as e:
        print(f"Error loading calibration CSV for user {user_id}: {e}")
        return {}


def save_user_calibration_to_db(user_id: str, features: Dict):
    """
    사용자 캘리브레이션 데이터를 데이터베이스에 저장
    
    Args:
        user_id: 사용자 ID
        features: 캘리브레이션 특징값 딕셔너리
    """
    db = next(get_db())
    
    # 캘리브레이션 특징값 저장
    save_user_calibration(db, user_id=int(user_id), calibration_features=features)
    
    print(f"✅ User calibration saved to database for user {user_id}")
    for key, value in features.items():
        print(f"  {key}: {value:.6f}")


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
        ft = f['type']
        direction = f.get('direction')  # YAML의 direction 설정 가져오기
        
        # points가 필요한 타입과 필요하지 않은 타입 구분
        if ft in ['calibration_ratio', 'spread_x']:
            # points가 필요하지 않거나 다르게 처리되는 타입들
            if ft == 'calibration_ratio':
                # 캘리브레이션 기준값 대비 비율 계산
                base_feature = f.get('base_feature')
                calibration_key = f.get('calibration_key')
                
                if base_feature and base_feature in feats and calibration and calibration_key in calibration:
                    baseline = calibration[calibration_key]
                    current_values = feats[base_feature]
                    feats[nm] = current_values / (baseline + 1e-8)
                else:
                    print(f"Warning: Cannot calculate calibration ratio for {nm}")
                    feats[nm] = np.ones(len(df))
                    
            elif ft == 'spread_x':
                pts = f['points']
                # 지정된 랜드마크들의 X좌표 분산 계산
                x_coords = []
                for pt_idx in pts:
                    if f'x{pt_idx}' in df.columns:
                        x_coords.append(df[f'x{pt_idx}'].values)
                
                if x_coords:
                    # 각 프레임별로 X좌표들의 분산 계산
                    x_coords_array = np.array(x_coords).T  # (frames, landmarks)
                    feats[nm] = np.var(x_coords_array, axis=1)
                else:
                    print(f"Warning: No valid coordinates found for feature {nm}")
                    feats[nm] = np.zeros(len(df))
        else:
            # points가 필요한 타입들
            pts = f['points']
            
            if ft == 'distance' and len(pts) == 2:
                a = df[[f'x{pts[0]}', f'y{pts[0]}']].to_numpy()
                b = df[[f'x{pts[1]}', f'y{pts[1]}']].to_numpy()
                feats[nm] = compute_distance(a, b)

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

            elif ft == 'delta_x' and len(pts) == 2:
                x1 = df[f'x{pts[0]}'].to_numpy()
                x2 = df[f'x{pts[1]}'].to_numpy()
                feats[nm] = x1 - x2

            elif ft == 'between_x' and len(pts) == 3:
                # X좌표에서 pts[1]이 pts[0]과 pts[2] 사이에 있는지 확인
                x0 = df[f'x{pts[0]}'].values
                x1 = df[f'x{pts[1]}'].values  # 중간에 있어야 할 점
                x2 = df[f'x{pts[2]}'].values
                
                # pts[1]이 pts[0]과 pts[2] 사이에 있으면 True(1), 아니면 False(0)
                min_x = np.minimum(x0, x2)
                max_x = np.maximum(x0, x2)
                feats[nm] = ((x1 >= min_x) & (x1 <= max_x)).astype(float)

            elif ft == 'between_y' and len(pts) == 3:
                # Y좌표에서 pts[1]이 pts[0]과 pts[2] 사이에 있는지 확인
                y0 = df[f'y{pts[0]}'].values
                y1 = df[f'y{pts[1]}'].values  # 중간에 있어야 할 점
                y2 = df[f'y{pts[2]}'].values
                
                # pts[1]이 pts[0]과 pts[2] 사이에 있으면 True(1), 아니면 False(0)
                min_y = np.minimum(y0, y2)
                max_y = np.maximum(y0, y2)
                feats[nm] = ((y1 >= min_y) & (y1 <= max_y)).astype(float)

            elif ft == 'between' and len(pts) == 3:
                # X, Y 좌표 모두에서 pts[1]이 pts[0]과 pts[2] 사이에 있는지 확인
                x0, y0 = df[f'x{pts[0]}'].values, df[f'y{pts[0]}'].values
                x1, y1 = df[f'x{pts[1]}'].values, df[f'y{pts[1]}'].values
                x2, y2 = df[f'x{pts[2]}'].values, df[f'y{pts[2]}'].values
                
                # X 좌표 체크
                min_x = np.minimum(x0, x2)
                max_x = np.maximum(x0, x2)
                x_between = (x1 >= min_x) & (x1 <= max_x)
                
                # Y 좌표 체크
                min_y = np.minimum(y0, y2)
                max_y = np.maximum(y0, y2)
                y_between = (y1 >= min_y) & (y1 <= max_y)
                
                # 둘 다 만족해야 함
                feats[nm] = (x_between & y_between).astype(float)

            elif ft == 'distance_comparison' and len(pts) == 4:
                # 두 거리를 비교: distance(pts[0], pts[1]) vs distance(pts[2], pts[3])
                # 첫 번째 거리가 더 짧으면 1.0, 두 번째가 더 짧으면 0.0
                
                # 첫 번째 거리: pts[0] - pts[1]
                p1 = df[[f'x{pts[0]}', f'y{pts[0]}']].to_numpy()
                p2 = df[[f'x{pts[1]}', f'y{pts[1]}']].to_numpy()
                dist1 = compute_distance(p1, p2)
                
                # 두 번째 거리: pts[2] - pts[3]
                p3 = df[[f'x{pts[2]}', f'y{pts[2]}']].to_numpy()
                p4 = df[[f'x{pts[3]}', f'y{pts[3]}']].to_numpy()
                dist2 = compute_distance(p3, p4)
                
                # 첫 번째가 더 짧으면 1, 두 번째가 더 짧으면 0
                feats[nm] = (dist1 < dist2).astype(float)

            elif ft == 'distance_ratio' and len(pts) == 4:
                # 두 거리의 비율: distance(pts[0], pts[1]) / distance(pts[2], pts[3])
                
                # 첫 번째 거리: pts[0] - pts[1]
                p1 = df[[f'x{pts[0]}', f'y{pts[0]}']].to_numpy()
                p2 = df[[f'x{pts[1]}', f'y{pts[1]}']].to_numpy()
                dist1 = compute_distance(p1, p2)
                
                # 두 번째 거리: pts[2] - pts[3]
                p3 = df[[f'x{pts[2]}', f'y{pts[2]}']].to_numpy()
                p4 = df[[f'x{pts[3]}', f'y{pts[3]}']].to_numpy()
                dist2 = compute_distance(p3, p4)
                
                # 비율 계산 (0으로 나누기 방지)
                feats[nm] = dist1 / (dist2 + 1e-8)

            elif ft == 'distance_difference' and len(pts) == 4:
                # 두 거리의 차이: distance(pts[0], pts[1]) - distance(pts[2], pts[3])
                
                # 첫 번째 거리: pts[0] - pts[1]
                p1 = df[[f'x{pts[0]}', f'y{pts[0]}']].to_numpy()
                p2 = df[[f'x{pts[1]}', f'y{pts[1]}']].to_numpy()
                dist1 = compute_distance(p1, p2)
                
                # 두 번째 거리: pts[2] - pts[3]
                p3 = df[[f'x{pts[2]}', f'y{pts[2]}']].to_numpy()
                p4 = df[[f'x{pts[3]}', f'y{pts[3]}']].to_numpy()
                dist2 = compute_distance(p3, p4)
                
                # 차이 계산
                feats[nm] = dist1 - dist2

            else:
                raise ValueError(f"Unknown feature type or wrong definition: {f}")

    # Add delta_ features
    if calibration:
        for key, base in calibration.items():
            if key in feats:
                feats[f'delta_{key}'] = np.abs(feats[key] - base)

    return pd.DataFrame(feats)


def segment_holds(feat_df: pd.DataFrame, cfg: Dict, fps: int = 30, use_calibration: bool = True, user_id: str = None):
    """
    연속 구간 기반 hold 세그멘테이션 - 설정된 시간 이상의 연속 구간 찾기
    
    Args:
        feat_df: DataFrame containing extracted features
        cfg: Configuration dictionary containing thresholds
        fps: Frames per second
        use_calibration: Whether to use calibration values for thresholds (False for preprocessing)
        user_id: User ID for loading calibration data (required when use_calibration=True)
    
    Returns:
        List of (start, end) frame indices for segments that meet duration requirement
    """
    thr = cfg.get('thresholds', {})
    min_duration_frames = int(thr.get('min_hold_duration_sec', 1) * fps)
    
    print(f"=== Hold Segmentation ===")
    print(f"Total frames in data: {len(feat_df)}")
    print(f"Required continuous frames: {min_duration_frames} ({thr.get('min_hold_duration_sec', 1)} seconds)")
    print(f"Use calibration: {use_calibration}")
    
    # 캘리브레이션 사용 여부에 따라 전달
    calibration = None
    if use_calibration:
        if user_id:
            # 데이터베이스에서 사용자 캘리브레이션 로드
            calibration = load_user_calibration(user_id)
            
            # 데이터베이스에서 로드 실패 시 CSV 백업 시도
            if not calibration:
                calibration = load_user_calibration_from_csv(user_id)
            
            if calibration:
                print(f"Using user calibration for {user_id}: {list(calibration.keys())}")
            else:
                print(f"Warning: No calibration data found for user {user_id}")
                
        elif 'calibration' in cfg:
            # 설정에서 직접 가져오기 (테스트용)
            calibration = cfg['calibration']
            print(f"Using config calibration: {list(calibration.keys()) if calibration else 'None'}")
        else:
            print("Warning: use_calibration=True but no user_id provided and no calibration in config")
    
    # 모든 기본 조건 확인
    base_conditions = check_all_base_conditions(feat_df, thr, calibration)
    
    total_satisfied = base_conditions.sum()
    print(f"Total satisfied frames: {total_satisfied}/{len(feat_df)} ({total_satisfied/len(feat_df)*100:.1f}%)")
    
    if total_satisfied < min_duration_frames:
        print(f"Insufficient satisfied frames. Need {min_duration_frames}, got {total_satisfied}")
        return []
    
    # 방향 판단이 필요한 경우
    if 'direction' in cfg:
        return segment_holds_with_direction(feat_df, cfg, fps, base_conditions, min_duration_frames)
    else:
        return find_continuous_segments(base_conditions, min_duration_frames)


def find_continuous_segments(mask: np.ndarray, min_duration: int) -> List[Tuple[int, int]]:
    """
    연속된 True 구간 중에서 min_duration 이상인 구간들을 찾기
    
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
            # 연속 구간 시작
            start = i
        elif not m and start is not None:
            # 연속 구간 끝
            if i - start >= min_duration:
                segments.append((start, i))
                print(f"Found continuous segment: frames {start}-{i} ({i-start} frames, {(i-start)/30:.2f}s)")
            start = None
    
    # 마지막까지 연속이면
    if start is not None and len(mask) - start >= min_duration:
        segments.append((start, len(mask)))
        print(f"Found continuous segment: frames {start}-{len(mask)} ({len(mask)-start} frames, {(len(mask)-start)/30:.2f}s)")
    
    print(f"Total continuous segments found: {len(segments)}")
    return segments


def check_all_base_conditions(feat_df: pd.DataFrame, thresholds: Dict, calibration: Dict = None) -> np.ndarray:
    """모든 기본 임계값 조건을 확인하여 boolean array 반환"""
    conditions = np.ones(len(feat_df), dtype=bool)
    
    # 캘리브레이션 사용 여부 결정
    use_calibration = calibration is not None
    
    for k, v in thresholds.items():
        if k == 'min_hold_duration_sec':
            continue
        
        # 캘리브레이션 기반 임계값 처리
        if k.startswith('calibration_'):
            if not use_calibration:
                print(f"  Skipping calibration threshold {k} (preprocessing mode)")
                continue
                
            if not isinstance(v, dict):
                print(f"  Warning: Invalid calibration threshold {k}")
                continue
                
            calibration_key = v.get('calibration_key')
            operator = v.get('operator', 'greater_than')
            offset = v.get('offset', 0.0)
            message = v.get('message', f'{k} 조건을 만족하지 않습니다.')
            
            if calibration_key not in calibration:
                print(f"  Warning: Calibration key {calibration_key} not found")
                continue
            
            # 실제 임계값 = 캘리브레이션 값 + offset
            baseline_value = calibration[calibration_key]
            threshold_value = baseline_value + offset
            
            # feature 이름 추출 (calibration_min_ 또는 calibration_max_ 제거)
            feat_name = k.replace('calibration_min_', '').replace('calibration_max_', '')
            
            if feat_name in feat_df.columns:
                if operator == 'greater_than':
                    condition = feat_df[feat_name] > threshold_value
                elif operator == 'greater_equal':
                    condition = feat_df[feat_name] >= threshold_value
                elif operator == 'less_than':
                    condition = feat_df[feat_name] < threshold_value
                elif operator == 'less_equal':
                    condition = feat_df[feat_name] <= threshold_value
                else:
                    print(f"  Warning: Unknown operator {operator}")
                    continue
                
                conditions &= condition
                passes = condition.sum()
                print(f"  [CALIB] {feat_name} {operator} {threshold_value:.4f} (calib:{baseline_value:.4f}{offset:+.4f}): {passes}/{len(feat_df)} frames pass ({passes/len(feat_df)*100:.1f}%)")
            else:
                print(f"  Warning: Feature {feat_name} not found in DataFrame")
        
        # 일반 임계값 처리 (전처리용 또는 캘리브레이션 대체용)
        else:
            # 캘리브레이션 사용 시 해당 feature의 캘리브레이션 버전이 있는지 확인
            if use_calibration:
                # 동일한 feature에 대한 calibration 버전이 있는지 확인
                calibration_equivalent = None
                if k.startswith('min_'):
                    feat_name = k[4:]
                    calibration_equivalent = f'calibration_min_{feat_name}'
                elif k.startswith('max_'):
                    feat_name = k[4:]
                    calibration_equivalent = f'calibration_max_{feat_name}'
                
                # 캘리브레이션 버전이 있으면 일반 버전은 건너뜀
                if calibration_equivalent and calibration_equivalent in thresholds:
                    print(f"  Skipping {k} (using calibration version: {calibration_equivalent})")
                    continue
            
            # 새로운 형태 (값 + 메시지) 처리
            if isinstance(v, dict) and 'value' in v:
                threshold_value = v['value']
            else:
                # 기존 형태 (값만) 처리  
                threshold_value = v
                
            if k.startswith('min_'):
                feat_name = k[4:]
                if feat_name in feat_df.columns:
                    condition = feat_df[feat_name] >= threshold_value
                    conditions &= condition
                    passes = condition.sum()
                    mode_prefix = "[PREPROCESS]" if not use_calibration else "[FIXED]"
                    print(f"  {mode_prefix} {feat_name} >= {threshold_value}: {passes}/{len(feat_df)} frames pass ({passes/len(feat_df)*100:.1f}%)")
                    
            elif k.startswith('max_'):
                feat_name = k[4:]
                if feat_name in feat_df.columns:
                    condition = feat_df[feat_name] <= threshold_value
                    conditions &= condition
                    passes = condition.sum()
                    mode_prefix = "[PREPROCESS]" if not use_calibration else "[FIXED]"
                    print(f"  {mode_prefix} {feat_name} <= {threshold_value}: {passes}/{len(feat_df)} frames pass ({passes/len(feat_df)*100:.1f}%)")
            
            elif k.startswith('abs_'):
                    feat_name = k[4:]  # 'abs_' 제거
                    if feat_name in feat_df.columns:
                        # 절댓값이 임계값을 넘어서야 함
                        condition = np.abs(feat_df[feat_name]) >= threshold_value
                        conditions &= condition
                        passes = condition.sum()
                        mode_prefix = "[PREPROCESS]" if not use_calibration else "[FIXED]"
                        print(f"  {mode_prefix} |{feat_name}| >= {threshold_value}: {passes}/{len(feat_df)} frames pass ({passes/len(feat_df)*100:.1f}%)")
    
    return conditions


def segment_holds_with_direction(feat_df: pd.DataFrame, cfg: Dict, fps: int, 
                                base_conditions: np.ndarray, min_duration_frames: int):
    """방향별 연속 구간 세그멘테이션"""
    direction_cfg = cfg['direction']
    segments_by_direction = {}
    
    for direction, conditions in direction_cfg.items():
        print(f"\n--- Direction: {direction} ---")
        
        # 방향별 조건 확인
        direction_mask = np.ones(len(feat_df), dtype=bool)
        for feat_name, condition_cfg in conditions.items():
            if feat_name in feat_df.columns:
                sign = condition_cfg['sign']
                threshold = condition_cfg['threshold']
                
                if sign == 'positive':
                    condition = feat_df[feat_name] > threshold
                elif sign == 'negative':
                    condition = feat_df[feat_name] < -threshold
                elif sign == 'interval':
                    condition = (feat_df[feat_name] > -threshold) & (feat_df[feat_name] < threshold)
                else:
                    continue
                    
                direction_mask &= condition
                passes = condition.sum()
                print(f"  {feat_name} {sign} {threshold}: {passes}/{len(feat_df)} frames pass")
        
        # 기본 조건과 방향 조건을 모두 만족하는 프레임들
        combined_conditions = base_conditions & direction_mask
        satisfied_count = combined_conditions.sum()
        
        print(f"Combined conditions for {direction}: {satisfied_count}/{len(feat_df)} frames pass")
        
        if satisfied_count >= min_duration_frames:
            # 연속 구간 찾기
            segments = find_continuous_segments(combined_conditions, min_duration_frames)
            if segments:
                segments_by_direction[direction] = segments
                print(f"Created {len(segments)} segments for direction {direction}")
    
    return segments_by_direction