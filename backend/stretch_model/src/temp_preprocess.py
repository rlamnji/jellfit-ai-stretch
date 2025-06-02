#!/usr/bin/env python3
import os
import glob
import argparse
import pandas as pd
import yaml
import json
from pathlib import Path
from utils import load_config, segment_holds, extract_features
from typing import Union, Dict, List, Tuple


def load_calibration_for_exercise(cfg: Dict, person_id: str = None, calibration_dir: str = "data/calibration") -> Dict:
    """
    운동 설정에 따라 필요한 캘리브레이션 값들을 로드
    
    Args:
        cfg: 운동 설정 (YAML에서 로드된)
        person_id: 테스트 모드에서 사용할 사람 번호 (None이면 일반 모드)
        calibration_dir: 캘리브레이션 파일 디렉토리
        
    Returns:
        필요한 캘리브레이션 값들의 딕셔너리
    """
    # YAML에서 calibration 필드 확인
    required_calibration = cfg.get('calibration', [])
    
    if not required_calibration:
        # 캘리브레이션이 필요하지 않은 스트레칭
        print("  No calibration required for this exercise")
        return {}
    
    print(f"  Required calibration values: {required_calibration}")
    
    if person_id:
        # 테스트 모드: 특정 사람의 캘리브레이션 로드
        all_calibration = load_test_calibration(person_id, calibration_dir)
        
        # 필요한 값들만 추출
        exercise_calibration = {}
        for key in required_calibration:
            if key in all_calibration:
                exercise_calibration[key] = all_calibration[key]
                print(f"    {key}: {all_calibration[key]:.6f}")
            else:
                print(f"    Warning: {key} not found in calibration data")
        
        return exercise_calibration
    else:
        # 일반 모드: 기존 방식 (test_calibration.yaml 등)
        calib_path = os.path.join('config', 'test_calibration.yaml')
        if os.path.exists(calib_path):
            with open(calib_path, encoding='utf-8') as f:
                all_calibration = yaml.safe_load(f).get('calibration', {})
                
            # 필요한 값들만 추출
            exercise_calibration = {}
            for key in required_calibration:
                if key in all_calibration:
                    exercise_calibration[key] = all_calibration[key]
                    print(f"    {key}: {all_calibration[key]:.6f}")
                else:
                    print(f"    Warning: {key} not found in calibration data")
            
            return exercise_calibration
        else:
            print("  Warning: No calibration file found")
            return {}


def load_test_calibration(person_id: str, calibration_dir: str = "data") -> Dict:
    """
    테스트 캘리브레이션 결과에서 특정 사람의 캘리브레이션 값을 로드
    
    Args:
        person_id: 사람 번호 (1, 2, 3)
        calibration_dir: 캘리브레이션 파일이 있는 디렉토리
        
    Returns:
        해당 사람의 캘리브레이션 데이터
    """
    calib_dir = Path(calibration_dir)
    
    # 최신 캘리브레이션 결과 파일 찾기
    json_files = list(calib_dir.glob("*.json"))
    if not json_files:
        print(f"Warning: No calibration results found in {calib_dir}")
        return {}
    
    # 가장 최신 파일 사용
    latest_file = max(json_files, key=lambda x: x.stat().st_mtime)
    
    try:
        with open(latest_file, 'r', encoding='utf-8') as f:
            calibration_data = json.load(f)
        
        # 해당 사람의 개별 특징값 가져오기
        individual_features = calibration_data.get('individual_features', {})
        
        if person_id in individual_features:
            person_calibration = individual_features[person_id]
            print(f"Loaded calibration for person {person_id}:")
            for key, value in person_calibration.items():
                print(f"  {key}: {value:.6f}")
            return person_calibration
        else:
            print(f"Warning: No calibration data found for person {person_id}")
            print(f"Available persons: {list(individual_features.keys())}")
            return {}
            
    except Exception as e:
        print(f"Error loading calibration file {latest_file}: {e}")
        return {}


def find_test_files(exercise: str, person_id: str, data_dir: str = "data") -> List[str]:
    """
    테스트용 파일들을 찾기
    
    Args:
        exercise: 운동 이름
        person_id: 사람 번호
        data_dir: 데이터 디렉토리
        
    Returns:
        해당하는 파일들의 경로 리스트
    """
    data_path = Path(data_dir)
    
    # 파일 패턴: <exercise>_<번호>_1_landmarks.csv
    pattern = f"processed/{exercise}/{exercise}_{person_id}_1_landmarks.csv"
    files = list(data_path.glob(pattern))
    
    if not files:
        # 여러 경로에서 찾아보기
        for subdir in data_path.iterdir():
            if subdir.is_dir():
                files.extend(subdir.glob(pattern))
    
    return [str(f) for f in files]


def filter_landmarks(df, landmarks):
    """
    Keep only 'frame' and specified landmark columns
    """
    cols = ['frame'] if 'frame' in df.columns else []
    for lm in landmarks:
        cols += [f'x{lm}', f'y{lm}', f'z{lm}']
    return df[cols]


def process_exercise_test_mode(df_filt, base, exercise, cfg, out_dir, fps, person_id):
    """
    테스트 모드용 운동 처리 (hold 타입만 지원)
    """
    # extract features
    feat_df = extract_features(
        df_filt,
        cfg['features'],
        calibration=cfg.get('calibration', {}),
        z_scale=cfg.get('z_scale', 1.0)
    )
    
    cycles_cfg = cfg.get('cycles', {})
    ctype = cycles_cfg.get('type', 'hold')
    
    if ctype != 'hold':
        print(f"Warning: Test mode only supports hold type exercises. Skipping {exercise}")
        return
    
    # 방향 판단이 필요한 경우 (sides 또는 direction이 있는 경우)
    has_direction = 'direction' in cfg or 'sides' in cfg
    
    if has_direction:
        # hold + direction
        segments_by_direction = segment_holds(feat_df, cfg, fps)
        process_direction_segments_test(feat_df, segments_by_direction, base, exercise, out_dir, fps, ctype, person_id)
    else:
        # hold only
        segments = segment_holds(feat_df, cfg, fps)
        process_hold_segments_test(feat_df, segments, base, exercise, out_dir, fps, person_id)


def process_direction_segments_test(feat_df, segments_by_direction, base, exercise, out_dir, fps, ctype, person_id):
    """방향별 세그먼트 처리 (테스트 모드)"""
    summaries = []
    
    if isinstance(segments_by_direction, dict):
        # 방향별 세그먼트 처리
        for direction, segments in segments_by_direction.items():
            for idx, (s, e) in enumerate(segments, start=1):
                segment_df = feat_df.iloc[s:e].reset_index(drop=True)
                feat_name = f"{base}_{direction}_{ctype}{idx}_person{person_id}_features.csv"
                segment_df.to_csv(os.path.join(out_dir, feat_name), index=False)
                print(f"  Saved: {exercise}/{feat_name}")
                
                summ = {
                    'segment': idx,
                    'direction': direction,
                    'person_id': person_id,
                    'duration': (e - s) / fps
                }
                summaries.append(summ)
    else:
        # 단일 방향 세그먼트 처리
        for idx, (s, e) in enumerate(segments_by_direction, start=1):
            segment_df = feat_df.iloc[s:e].reset_index(drop=True)
            feat_name = f"{base}_{ctype}{idx}_person{person_id}_features.csv"
            segment_df.to_csv(os.path.join(out_dir, feat_name), index=False)
            print(f"  Saved: {exercise}/{feat_name}")
            
            summ = {
                'segment': idx,
                'direction': 'none',
                'person_id': person_id,
                'duration': (e - s) / fps
            }
            summaries.append(summ)
    
    if summaries:
        sum_df = pd.DataFrame(summaries)
        sum_name = f"{base}_{ctype}_person{person_id}_summary.csv"
        sum_df.to_csv(os.path.join(out_dir, sum_name), index=False)
        print(f"  Saved summary: {exercise}/{sum_name}")


def process_hold_segments_test(feat_df, segments, base, exercise, out_dir, fps, person_id):
    """Hold 세그먼트 처리 (테스트 모드)"""
    summaries = []
    for idx, (s, e) in enumerate(segments, start=1):
        segment_df = feat_df.iloc[s:e].reset_index(drop=True)
        feat_name = f"{base}_hold{idx}_person{person_id}_features.csv"
        segment_df.to_csv(os.path.join(out_dir, feat_name), index=False)
        print(f"  Saved: {exercise}/{feat_name}")
        
        summ = {
            'segment': idx,
            'person_id': person_id,
            'duration': (e - s) / fps
        }
        summaries.append(summ)
    
    if summaries:
        sum_df = pd.DataFrame(summaries)
        sum_name = f"{base}_hold_person{person_id}_summary.csv"
        sum_df.to_csv(os.path.join(out_dir, sum_name), index=False)
        print(f"  Saved summary: {exercise}/{sum_name}")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--exercise', help='운동 이름 (생략 시 전체)')
    parser.add_argument('--test', choices=['1', '2', '3'], 
                       help='테스트 모드: 특정 사람의 캘리브레이션 사용 (1, 2, 3)')
    parser.add_argument('--calibration-dir', default='data/calibration',
                       help='캘리브레이션 파일 디렉토리 (기본값: data/calibration)')
    parser.add_argument('--data-dir', default='data',
                       help='데이터 파일 디렉토리 (기본값: data)')
    args = parser.parse_args()

    # 테스트 모드 실행
    if args.test:
        print(f"=== 테스트 모드 실행 (사람 {args.test}) ===")
        
        # 테스트 모드 실행
        print(f"  Removed unused person_calibration loading")
        
        # config 파일 리스트
        cfg_files = [p for p in glob.glob('config/*.yaml') 
                    if os.path.basename(p) not in ['test_calibration.yaml', 'calibration_features.yaml']]
        if args.exercise:
            cfg_files = [p for p in cfg_files if os.path.splitext(os.path.basename(p))[0] == args.exercise]
        
        for cfg_path in cfg_files:
            exercise = os.path.splitext(os.path.basename(cfg_path))[0]
            print(f"\nProcessing exercise: {exercise} for person {args.test}")
            
            cfg = load_config(cfg_path)
            
            # 운동별 필요한 캘리브레이션 로드
            exercise_calibration = load_calibration_for_exercise(cfg, args.test, args.calibration_dir)
            cfg['calibration'] = exercise_calibration
            
            fps = cfg.get('fps', 30)
            out_dir = os.path.join('data', 'features', f"{exercise}_test_person{args.test}")
            os.makedirs(out_dir, exist_ok=True)
            
            # 기존 파일 정리
            for old_fp in glob.glob(os.path.join(out_dir, '*')):
                try:
                    os.remove(old_fp)
                except OSError:
                    pass
            
            # 해당 사람의 파일 찾기
            test_files = find_test_files(exercise, args.test, args.data_dir)
            
            if not test_files:
                print(f"  No test files found for {exercise}_person{args.test}")
                continue
                
            for fp in test_files:
                print(f"  Processing file: {fp}")
                try:
                    df_raw = pd.read_csv(fp)
                    df_filt = filter_landmarks(df_raw, cfg['landmarks'])
                    base = f"{exercise}_{args.test}"
                    
                    process_exercise_test_mode(df_filt, base, exercise, cfg, out_dir, fps, args.test)
                    
                except Exception as e:
                    print(f"  Error processing {fp}: {e}")
        
        print(f"\n=== 테스트 모드 완료 (사람 {args.test}) ===")
        return

    # 일반 모드 실행
    print("=== 일반 모드 실행 ===")
    
    # load calibration
    calib_path = os.path.join('config', 'test_calibration.yaml')
    calibration = {}
    if os.path.exists(calib_path):
        with open(calib_path, encoding='utf-8') as f:
            calibration = yaml.safe_load(f).get('calibration', {})

    # list config files
    cfg_files = [p for p in glob.glob('config/*.yaml') 
                if os.path.basename(p) not in ['test_calibration.yaml', 'calibration_features.yaml']]
    if args.exercise:
        cfg_files = [p for p in cfg_files if os.path.splitext(os.path.basename(p))[0] == args.exercise]

    for cfg_path in cfg_files:
        exercise = os.path.splitext(os.path.basename(cfg_path))[0]
        print(f"Processing exercise: {exercise}")
        cfg = load_config(cfg_path)
        
        # 운동별 필요한 캘리브레이션 로드
        exercise_calibration = load_calibration_for_exercise(cfg)
        cfg['calibration'] = exercise_calibration
        
        fps = cfg.get('fps', 30)
        raw_dir = os.path.join('data', 'processed', exercise)
        out_dir = os.path.join('data', 'features', exercise)
        os.makedirs(out_dir, exist_ok=True)

        for old_fp in glob.glob(os.path.join(out_dir, '*')):
            try:
                os.remove(old_fp)
            except OSError:
                pass

        for fp in glob.glob(os.path.join(raw_dir, '*.csv')):
            df_raw = pd.read_csv(fp)
            df_filt = filter_landmarks(df_raw, cfg['landmarks'])
            base = os.path.splitext(os.path.basename(fp))[0]
            
            # 기존 process_exercise 함수 호출 (hold 타입만 지원)
            cycles_cfg = cfg.get('cycles', {})
            ctype = cycles_cfg.get('type', 'hold')
            
            if ctype == 'hold':
                # extract features
                feat_df = extract_features(
                    df_filt,
                    cfg['features'],
                    calibration=cfg.get('calibration', {}),
                    z_scale=cfg.get('z_scale', 1.0)
                )
                
                has_direction = 'direction' in cfg or 'sides' in cfg
                
                if has_direction:
                    segments_by_direction = segment_holds(feat_df, cfg, fps)
                    process_direction_segments(feat_df, segments_by_direction, base, exercise, out_dir, fps, ctype)
                else:
                    segments = segment_holds(feat_df, cfg, fps)
                    process_hold_segments(feat_df, segments, base, exercise, out_dir, fps)
            else:
                print(f"Skipping {exercise}: Only hold type exercises are supported")


# 기존 함수들 (process_direction_segments, process_hold_segments) 유지
def process_direction_segments(feat_df, segments_by_direction, base, exercise, out_dir, fps, ctype):
    """Process hold segments with direction detection."""
    summaries = []
    
    if isinstance(segments_by_direction, dict):
        # 방향별 세그먼트 처리
        for direction, segments in segments_by_direction.items():
            for idx, (s, e) in enumerate(segments, start=1):
                segment_df = feat_df.iloc[s:e].reset_index(drop=True)
                feat_name = f"{base}_{direction}_{ctype}{idx}_features.csv"
                segment_df.to_csv(os.path.join(out_dir, feat_name), index=False)
                print(f"  Saved: {exercise}/{feat_name}")
                
                summ = {
                    'segment': idx,
                    'direction': direction,
                    'duration': (e - s) / fps
                }
                summaries.append(summ)
    else:
        # 단일 방향 세그먼트 처리
        for idx, (s, e) in enumerate(segments_by_direction, start=1):
            segment_df = feat_df.iloc[s:e].reset_index(drop=True)
            feat_name = f"{base}_{ctype}{idx}_features.csv"
            segment_df.to_csv(os.path.join(out_dir, feat_name), index=False)
            print(f"  Saved: {exercise}/{feat_name}")
            
            summ = {
                'segment': idx,
                'direction': 'none',
                'duration': (e - s) / fps
            }
            summaries.append(summ)
    
    if summaries:
        sum_df = pd.DataFrame(summaries)
        sum_name = f"{base}_{ctype}_summary.csv"
        sum_df.to_csv(os.path.join(out_dir, sum_name), index=False)
        print(f"  Saved summary: {exercise}/{sum_name}")


def process_hold_segments(feat_df, segments, base, exercise, out_dir, fps):
    """Process hold segments without direction."""
    summaries = []
    for idx, (s, e) in enumerate(segments, start=1):
        segment_df = feat_df.iloc[s:e].reset_index(drop=True)
        feat_name = f"{base}_hold{idx}_features.csv"
        segment_df.to_csv(os.path.join(out_dir, feat_name), index=False)
        print(f"  Saved: {exercise}/{feat_name}")
        
        summ = {
            'segment': idx,
            'duration': (e - s) / fps
        }
        summaries.append(summ)
    
    if summaries:
        sum_df = pd.DataFrame(summaries)
        sum_name = f"{base}_hold_summary.csv"
        sum_df.to_csv(os.path.join(out_dir, sum_name), index=False)
        print(f"  Saved summary: {exercise}/{sum_name}")


if __name__ == '__main__':
    main()