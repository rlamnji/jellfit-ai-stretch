#!/usr/bin/env python3
import os
import glob
import argparse
import pandas as pd
import yaml
import json
import numpy as np
from pathlib import Path
from .utils import load_config, extract_features
from typing import Dict, List


def load_calibration_for_exercise(cfg: Dict, person_id: str = None, calibration_dir: str = "data/calibration") -> Dict:
    """
    운동 설정에 따라 필요한 캘리브레이션 값들을 로드
    """
    required_calibration = cfg.get('calibration', [])
    
    if not required_calibration:
        print("  No calibration required for this exercise")
        return {}
    
    print(f"  Required calibration values: {required_calibration}")
    
    if person_id:
        # 테스트 모드: 특정 사람의 캘리브레이션 로드
        calib_dir = Path(calibration_dir)
        json_files = list(calib_dir.glob("calibration_results_*.json"))
        
        if not json_files:
            print(f"Warning: No calibration results found in {calib_dir}")
            return {}
        
        latest_file = max(json_files, key=lambda x: x.stat().st_mtime)
        
        try:
            with open(latest_file, 'r', encoding='utf-8') as f:
                calibration_data = json.load(f)
            
            individual_features = calibration_data.get('individual_features', {})
            
            if person_id in individual_features:
                all_calibration = individual_features[person_id]
                
                exercise_calibration = {}
                for key in required_calibration:
                    if key in all_calibration:
                        exercise_calibration[key] = all_calibration[key]
                        print(f"    {key}: {all_calibration[key]:.6f}")
                    else:
                        print(f"    Warning: {key} not found in calibration data")
                
                return exercise_calibration
            else:
                print(f"Warning: No calibration data found for person {person_id}")
                return {}
                
        except Exception as e:
            print(f"Error loading calibration file: {e}")
            return {}
    else:
        # 일반 모드
        calib_path = os.path.join('config', 'test_calibration.yaml')
        if os.path.exists(calib_path):
            with open(calib_path, encoding='utf-8') as f:
                all_calibration = yaml.safe_load(f).get('calibration', {})
                
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


def estimate_aspect_ratio(df):
    """랜드마크 분포로 화면 비율 추정"""
    # 모든 랜드마크의 X, Y 범위 계산
    x_cols = [col for col in df.columns if col.startswith('x')]
    y_cols = [col for col in df.columns if col.startswith('y')]
    
    if not x_cols or not y_cols:
        print("Warning: No x or y coordinate columns found")
        return 16/9  # 기본값
    
    x_range = df[x_cols].max().max() - df[x_cols].min().min()
    y_range = df[y_cols].max().max() - df[y_cols].min().min()
    
    if y_range == 0:
        print("Warning: Y range is zero")
        return 16/9
    
    # 실제 사용 비율 (정규화되어 있으므로 역산)
    estimated_ratio = x_range / y_range
    
    print(f"X range: {x_range:.4f}, Y range: {y_range:.4f}")
    print(f"Estimated aspect ratio: {estimated_ratio:.2f}")
    
    # 일반적인 화면 비율과 비교
    if 1.7 <= estimated_ratio <= 1.8:
        print("  -> Likely 16:9 landscape")
    elif 0.55 <= estimated_ratio <= 0.6:
        print("  -> Likely 9:16 portrait")
    elif 1.3 <= estimated_ratio <= 1.4:
        print("  -> Likely 4:3 landscape")
    else:
        print(f"  -> Unusual aspect ratio")
    
    return estimated_ratio


def filter_landmarks(df, landmarks):
    """
    Keep only specified landmark columns
    """
    cols = ['frame'] if 'frame' in df.columns else []
    for lm in landmarks:
        cols += [f'x{lm}', f'y{lm}', f'z{lm}']
    
    # 존재하는 컬럼들만 선택
    existing_cols = [col for col in cols if col in df.columns]
    return df[existing_cols]


def find_data_files(exercise: str, person_id: str = None, data_dir: str = "data") -> List[str]:
    """
    데이터 파일들을 찾기
    """
    data_path = Path(data_dir)
    
    if person_id:
        # 테스트 모드: <exercise>_<person_id>_1_landmarks.csv
        pattern = f"{exercise}_{person_id}_1_landmarks.csv"
    else:
        # 일반 모드: data/processed/<exercise>/*.csv
        processed_dir = data_path / "processed" / exercise
        if processed_dir.exists():
            return [str(f) for f in processed_dir.glob("*.csv")]
        else:
            pattern = f"{exercise}_*.csv"
    
    files = list(data_path.glob(pattern))
    
    # 하위 디렉토리에서도 찾기
    if not files:
        for subdir in data_path.iterdir():
            if subdir.is_dir():
                files.extend(subdir.glob(pattern))
    
    return [str(f) for f in files]


def check_thresholds_detailed(feat_df: pd.DataFrame, thresholds: Dict, direction: str = None) -> pd.DataFrame:
    """
    임계값 조건들을 상세히 확인하고 각 프레임별 통과 여부를 DataFrame으로 반환
    """
    results = pd.DataFrame(index=feat_df.index)

    print(f"Using cumulative segmentation for {direction}")  # 이게 나오면 정확한 시간
    print(f"Using continuous segmentation")  # 이게 나오면 실제 연속 구간
    
    # 기본 임계값들
    print(f"\n=== Base Thresholds ===")
    for k, v in thresholds.items():
        if k == 'min_hold_duration_sec':
            continue
        
        # 값과 메시지 형태 처리
        if isinstance(v, dict) and 'value' in v:
            threshold_value = v['value']
        else:
            threshold_value = v
            
        if k.startswith('min_'):
            feat_name = k[4:]
            if feat_name in feat_df.columns:
                condition = feat_df[feat_name] >= threshold_value
                results[k] = condition
                passes = condition.sum()
                print(f"  {feat_name} >= {threshold_value}: {passes}/{len(feat_df)} frames pass")
                
        elif k.startswith('max_'):
            feat_name = k[4:]
            if feat_name in feat_df.columns:
                condition = feat_df[feat_name] <= threshold_value
                results[k] = condition
                passes = condition.sum()
                print(f"  {feat_name} <= {threshold_value}: {passes}/{len(feat_df)} frames pass")
        
        elif k.startswith('abs_'):
            feat_name = k[4:]
            if feat_name in feat_df.columns:
                condition = np.abs(feat_df[feat_name]) >= threshold_value
                results[k] = condition
                passes = condition.sum()
                print(f"  |{feat_name}| >= {threshold_value}: {passes}/{len(feat_df)} frames pass")
    
    # 방향별 임계값들 (있다면)
    if direction:
        direction_thresholds = thresholds.get('directional_thresholds', {}).get(direction, {})
        if direction_thresholds:
            print(f"\n=== {direction.title()} Direction Thresholds ===")
            for k, v in direction_thresholds.items():
                if isinstance(v, dict) and 'value' in v:
                    threshold_value = v['value']
                else:
                    threshold_value = v
                
                if k.startswith('min_'):
                    feat_name = k[4:]
                    if feat_name in feat_df.columns:
                        condition = feat_df[feat_name] >= threshold_value
                        results[f"{direction}_{k}"] = condition
                        passes = condition.sum()
                        print(f"  {feat_name} >= {threshold_value}: {passes}/{len(feat_df)} frames pass")
                        
                elif k.startswith('max_'):
                    feat_name = k[4:]
                    if feat_name in feat_df.columns:
                        condition = feat_df[feat_name] <= threshold_value
                        results[f"{direction}_{k}"] = condition
                        passes = condition.sum()
                        print(f"  {feat_name} <= {threshold_value}: {passes}/{len(feat_df)} frames pass")
    
    # 전체 조건 통과 여부
    if len(results.columns) > 0:
        results['all_pass'] = results.all(axis=1)
        total_pass = results['all_pass'].sum()
        print(f"\nCombined conditions: {total_pass}/{len(feat_df)} frames pass")
    
    return results


def main():
    parser = argparse.ArgumentParser(description='Feature 값들을 CSV로 출력하여 디버깅')
    parser.add_argument('--exercise', required=True, help='운동 이름')
    parser.add_argument('--test', choices=['1', '2', '3'], 
                       help='테스트 모드: 특정 사람의 데이터 사용')
    parser.add_argument('--calibration-dir', default='data/calibration',
                       help='캘리브레이션 파일 디렉토리')
    parser.add_argument('--data-dir', default='data',
                       help='데이터 파일 디렉토리')
    parser.add_argument('--output-dir', default='debug_output',
                       help='출력 디렉토리')
    args = parser.parse_args()

    print(f"=== Feature Debug for {args.exercise} ===")
    
    # 설정 로드
    cfg_path = f"config/{args.exercise}.yaml"
    if not os.path.exists(cfg_path):
        print(f"Error: Config file not found: {cfg_path}")
        return
    
    cfg = load_config(cfg_path)
    
    # 캘리브레이션 로드
    exercise_calibration = load_calibration_for_exercise(cfg, args.test, args.calibration_dir)
    cfg['calibration'] = exercise_calibration
    
    # 데이터 파일 찾기
    data_files = find_data_files(args.exercise, args.test, args.data_dir)
    
    if not data_files:
        print(f"Error: No data files found for {args.exercise}")
        if args.test:
            print(f"Looking for pattern: {args.exercise}_{args.test}_1_landmarks.csv")
        return
    
    print(f"Found {len(data_files)} data files:")
    for f in data_files:
        print(f"  {f}")
    
    # 출력 디렉토리 생성
    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # 각 파일 처리
    for file_path in data_files:
        print(f"\n=== Processing {file_path} ===")
        
        try:
            # 데이터 로드
            df_raw = pd.read_csv(file_path)
            df_filt = filter_landmarks(df_raw, cfg['landmarks'])
            
            # 화면 비율 추정
            print("\n--- Aspect Ratio Analysis ---")
            estimated_ratio = estimate_aspect_ratio(df_filt)
            
            # 특징 추출
            feat_df = extract_features(
                df_filt,
                cfg['features'],
                calibration=cfg.get('calibration', {}),
                z_scale=cfg.get('z_scale', 1.0)
            )
            
            # 파일명 생성
            base_name = Path(file_path).stem
            person_suffix = f"_person{args.test}" if args.test else ""
            
            # 1. 모든 특징값 저장
            features_output = output_dir / f"{base_name}{person_suffix}_features.csv"
            feat_df.to_csv(features_output, index=False)
            print(f"Saved features: {features_output}")
            
            # 2. 임계값 확인 결과 저장
            thresholds = cfg.get('thresholds', {})
            if thresholds:
                threshold_results = check_thresholds_detailed(feat_df, thresholds)
                threshold_output = output_dir / f"{base_name}{person_suffix}_thresholds.csv"
                
                # 특징값과 임계값 결과 합치기
                combined_df = pd.concat([feat_df, threshold_results], axis=1)
                combined_df.to_csv(threshold_output, index=False)
                print(f"Saved threshold analysis: {threshold_output}")
            
            # 3. 방향별 분석 (있다면)
            if 'direction' in cfg:
                direction_cfg = cfg['direction']
                for direction in direction_cfg.keys():
                    print(f"\n--- Direction: {direction} ---")
                    
                    # 방향별 조건 확인
                    direction_mask = np.ones(len(feat_df), dtype=bool)
                    direction_results = pd.DataFrame(index=feat_df.index)
                    
                    for feat_name, condition_cfg in direction_cfg[direction].items():
                        if feat_name in feat_df.columns:
                            sign = condition_cfg['sign']
                            threshold = condition_cfg['threshold']
                            
                            if sign == 'positive':
                                condition = feat_df[feat_name] > threshold
                            elif sign == 'negative':
                                condition = feat_df[feat_name] < -threshold
                            elif sign == 'interval':
                                condition = (-threshold < feat_df[feat_name]) & (feat_df[feat_name] < threshold)
                            else:
                                continue
                                
                            direction_mask &= condition
                            direction_results[f"{direction}_{feat_name}_{sign}"] = condition
                            passes = condition.sum()
                            print(f"  {feat_name} {sign} {threshold}: {passes}/{len(feat_df)} frames pass")
                    
                    direction_results[f"{direction}_all_pass"] = direction_mask
                    total_pass = direction_mask.sum()
                    print(f"Combined conditions for {direction}: {total_pass}/{len(feat_df)} frames pass")
                    
                    # 방향별 결과 저장
                    direction_output = output_dir / f"{base_name}{person_suffix}_direction_{direction}.csv"
                    direction_combined = pd.concat([feat_df, direction_results], axis=1)
                    direction_combined.to_csv(direction_output, index=False)
                    print(f"Saved direction analysis: {direction_output}")
            
            # 4. 화면 비율 정보와 요약 통계 저장
            summary_data = {
                'feature': [],
                'mean': [],
                'std': [],
                'min': [],
                'max': [],
                'count': []
            }
            
            for col in feat_df.columns:
                summary_data['feature'].append(col)
                summary_data['mean'].append(feat_df[col].mean())
                summary_data['std'].append(feat_df[col].std())
                summary_data['min'].append(feat_df[col].min())
                summary_data['max'].append(feat_df[col].max())
                summary_data['count'].append(len(feat_df))
            
            summary_df = pd.DataFrame(summary_data)
            
            # 화면 비율 정보 추가
            aspect_info = pd.DataFrame({
                'feature': ['estimated_aspect_ratio', 'x_coordinate_range', 'y_coordinate_range'],
                'mean': [estimated_ratio, 
                        df_filt[[col for col in df_filt.columns if col.startswith('x')]].max().max() - 
                        df_filt[[col for col in df_filt.columns if col.startswith('x')]].min().min(),
                        df_filt[[col for col in df_filt.columns if col.startswith('y')]].max().max() - 
                        df_filt[[col for col in df_filt.columns if col.startswith('y')]].min().min()],
                'std': [0, 0, 0],
                'min': [estimated_ratio, 
                       df_filt[[col for col in df_filt.columns if col.startswith('x')]].min().min(),
                       df_filt[[col for col in df_filt.columns if col.startswith('y')]].min().min()],
                'max': [estimated_ratio,
                       df_filt[[col for col in df_filt.columns if col.startswith('x')]].max().max(),
                       df_filt[[col for col in df_filt.columns if col.startswith('y')]].max().max()],
                'count': [len(feat_df), len(feat_df), len(feat_df)]
            })
            
            summary_df = pd.concat([summary_df, aspect_info], ignore_index=True)
            summary_output = output_dir / f"{base_name}{person_suffix}_summary.csv"
            summary_df.to_csv(summary_output, index=False)
            print(f"Saved summary statistics: {summary_output}")
            
        except Exception as e:
            print(f"Error processing {file_path}: {e}")
    
    print(f"\n=== Debug output saved to {output_dir} ===")


if __name__ == '__main__':
    main()