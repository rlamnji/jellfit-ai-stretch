def segment_reps_by_roundtrip(feat_df: pd.DataFrame, cfg: Dict, fps: int = 30) -> List[Tuple[int,int]]:
    """
    캘리브레이션 기반 왕복 탐지 - 중립 상태 대비 상대적 변화량으로 판단
    
    Args:
        feat_df: DataFrame containing extracted features
        cfg: configuration dictionary containing:
            - features: 사용할 feature 리스트 (단일 또는 복수)
            - neutral_delta_threshold: 중립 상태 판단을 위한 변화량 임계값
            - target_delta_threshold: 목표 상태 판단을 위한 변화량 임계값
            - min_hold_neutral_sec: neutral 상태 최소 유지 시간
            - min_hold_target_sec: target 상태 최소 유지 시간
        fps: frames per second
    
    Returns:
        List of (start, end) frame indices for each rep cycle
    """
    cycles_cfg = cfg.get('cycles', {})
    features = cycles_cfg.get('features', [])
    calibration = cfg.get('calibration', {})
    
    print(f"=== 캘리브레이션 기반 왕복 탐지 ===")
    print(f"Target features: {features}")
    print(f"Available calibration data: {list(calibration.keys())}")
    
    if not features:
        print("ERROR: No features specified in cycles config")
        return []
    
    # 단일 feature인 경우 리스트로 변환
    if isinstance(features, str):
        features = [features]
    
    # 캘리브레이션 데이터에서 기준값 가져오기
    baseline_values = {}
    for feature in features:
        baseline_key = f"neutral_{feature}"
        if baseline_key in calibration:
            baseline_values[feature] = calibration[baseline_key]
            print(f"Baseline for {feature}: {baseline_values[feature]:.4f}")
        else:
            print(f"WARNING: No calibration baseline for {feature}")
            return []
    
    # 각 feature별로 델타값 계산
    delta_values = calculate_feature_deltas(feat_df, features, baseline_values)
    
    # 여러 feature의 평균 또는 최대값 사용
    combination_method = cycles_cfg.get('feature_combination', 'average')
    combined_deltas = combine_feature_deltas(delta_values, combination_method)
    
    print(f"Combined delta range: {combined_deltas.min():.4f} ~ {combined_deltas.max():.4f}")
    print(f"Combined delta mean: {combined_deltas.mean():.4f}, std: {combined_deltas.std():.4f}")
    
    # 상태 임계값 (캘리브레이션 기준 대비 변화량)
    neutral_threshold = cycles_cfg.get('neutral_delta_threshold', 0.01)
    target_threshold = cycles_cfg.get('target_delta_threshold', 0.03)
    
    print(f"Neutral threshold: ±{neutral_threshold}")
    print(f"Target threshold: {target_threshold}")
    
    # 최소 유지 시간 (프레임 수로 변환)
    min_hold_neutral_frames = int(cycles_cfg.get('min_hold_neutral_sec', 0.3) * fps)
    min_hold_target_frames = int(cycles_cfg.get('min_hold_target_sec', 0.3) * fps)
    
    # 상태 분류: 0=neutral, 1=target, -1=invalid
    states = classify_states_by_delta(combined_deltas, neutral_threshold, target_threshold)
    
    # 상태 분포 출력
    unique, counts = np.unique(states, return_counts=True)
    print(f"State distribution: {dict(zip(['invalid', 'neutral', 'target'], [counts[states == i].sum() if (states == i).any() else 0 for i in [-1, 0, 1]]))}")
    
    # 연속된 같은 상태 구간 찾기  
    state_segments = find_state_segments(states)
    print(f"Found {len(state_segments)} state segments")
    
    # 최소 유지 시간을 만족하는 구간만 필터링
    valid_segments = filter_segments_by_duration(
        state_segments, 
        min_hold_neutral_frames, 
        min_hold_target_frames
    )
    print(f"Valid segments after duration filter: {len(valid_segments)}")
    
    # neutral ↔ target ↔ neutral 왕복 패턴 찾기
    rep_cycles = find_roundtrip_cycles(valid_segments, cycles_cfg, fps)
    
    print(f"Found {len(rep_cycles)} rep cycles using calibration-based detection")
    return rep_cycles


def calculate_feature_deltas(feat_df: pd.DataFrame, features: List[str], baseline_values: Dict[str, float]) -> Dict[str, np.ndarray]:
    """각 feature별로 캘리브레이션 기준 대비 절대 변화량 계산"""
    delta_values = {}
    
    for feature in features:
        if feature in feat_df.columns:
            baseline = baseline_values[feature]
            current_values = feat_df[feature].values
            # 절대 변화량 계산
            deltas = np.abs(current_values - baseline)
            delta_values[feature] = deltas
            print(f"Feature {feature}: baseline={baseline:.4f}, delta_range={deltas.min():.4f}~{deltas.max():.4f}")
        else:
            print(f"WARNING: Feature {feature} not found in DataFrame")
    
    return delta_values


def combine_feature_deltas(delta_values: Dict[str, np.ndarray], method: str = 'average') -> np.ndarray:
    """여러 feature의 델타값을 결합"""
    if not delta_values:
        return np.array([])
    
    delta_arrays = list(delta_values.values())
    
    if method == 'average':
        combined = np.mean(delta_arrays, axis=0)
    elif method == 'max':
        combined = np.max(delta_arrays, axis=0)
    elif method == 'min':
        combined = np.min(delta_arrays, axis=0)
    else:
        # 기본값은 첫 번째 feature 사용
        combined = delta_arrays[0]
    
    print(f"Combined deltas using {method} method")
    return combined


def classify_states_by_delta(combined_deltas: np.ndarray, neutral_threshold: float, target_threshold: float) -> np.ndarray:
    """캘리브레이션 기준 대비 변화량으로 상태 분류"""
    states = np.full(len(combined_deltas), -1, dtype=int)
    
    for i, delta in enumerate(combined_deltas):
        if delta <= neutral_threshold:
            states[i] = 0  # neutral (변화량이 작음)
        elif delta >= target_threshold:
            states[i] = 1  # target (변화량이 큼)
        # else: invalid state (-1) - 중간 상태
    
    return states


def find_state_segments(states: np.ndarray) -> List[Tuple[int, int, int]]:
    """연속된 같은 상태 구간들을 찾기"""
    segments = []
    current_state = states[0]
    start_idx = 0
    
    for i in range(1, len(states)):
        if states[i] != current_state:
            if current_state != -1:  # invalid 상태는 무시
                segments.append((current_state, start_idx, i))
            current_state = states[i]
            start_idx = i
    
    # 마지막 구간 추가
    if current_state != -1:
        segments.append((current_state, start_idx, len(states)))
    
    return segments


def filter_segments_by_duration(segments: List[Tuple[int, int, int]], 
                               min_neutral_frames: int, 
                               min_target_frames: int) -> List[Tuple[int, int, int]]:
    """최소 유지 시간을 만족하는 구간만 필터링"""
    valid_segments = []
    
    for state, start, end in segments:
        duration = end - start
        
        if state == 0:  # neutral
            if duration >= min_neutral_frames:
                valid_segments.append((state, start, end))
                print(f"Valid neutral segment: frames {start}-{end} ({duration} frames)")
        elif state == 1:  # target  
            if duration >= min_target_frames:
                valid_segments.append((state, start, end))
                print(f"Valid target segment: frames {start}-{end} ({duration} frames)")
    
    return valid_segments


def find_roundtrip_cycles(segments: List[Tuple[int, int, int]], 
                         cycles_cfg: Dict, 
                         fps: int) -> List[Tuple[int, int]]:
    """왕복 사이클 패턴 찾기"""
    rep_cycles = []
    min_cycle_duration = cycles_cfg.get('min_cycle_duration_sec', 1.0)
    
    # neutral → target → neutral 패턴 찾기
    for i in range(len(segments) - 2):
        state1, start1, end1 = segments[i]
        state2, start2, end2 = segments[i + 1]  
        state3, start3, end3 = segments[i + 2]
        
        # 올바른 왕복 시퀀스 확인
        if state1 == 0 and state2 == 1 and state3 == 0:
            cycle_start = start1
            cycle_end = end3
            
            # 최소 사이클 지속 시간 확인
            cycle_duration = (cycle_end - cycle_start) / fps
            if cycle_duration >= min_cycle_duration:
                rep_cycles.append((cycle_start, cycle_end))
                print(f"Found valid cycle: frames {cycle_start}-{cycle_end} ({cycle_duration:.2f}s)")
    
    return rep_cycles