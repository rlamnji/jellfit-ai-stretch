#!/usr/bin/env python3
import os
import glob
import argparse
import pandas as pd
import yaml
import numpy as np
import matplotlib.pyplot as plt
from utils import load_config, extract_features

def analyze_features(exercise_name, output_dir='data/analysis'):
    """
    임계값 검사 없이 특징을 추출하고 CSV로 저장하는 함수
    """
    # 설정 파일 로드
    cfg_path = os.path.join('config', f'{exercise_name}.yaml')
    with open(cfg_path, encoding='utf-8') as f:
        cfg = yaml.safe_load(f)
    
    # 캘리브레이션 데이터 로드
    calib_path = os.path.join('config', 'test_calibration.yaml')
    calibration = {}
    if os.path.exists(calib_path):
        with open(calib_path, encoding='utf-8') as f:
            calibration = yaml.safe_load(f).get('calibration', {})
    
    cfg['calibration'] = calibration
    fps = cfg.get('fps', 30)
    
    # 데이터 파일 찾기
    raw_dir = os.path.join('data', 'processed', exercise_name)
    if not os.path.exists(raw_dir):
        print(f"Error: Directory {raw_dir} does not exist")
        return
    
    # 출력 디렉토리 생성
    os.makedirs(output_dir, exist_ok=True)
    
    # 임계값 저장 (분석용)
    thresholds = cfg.get('thresholds', {})
    
    for fp in glob.glob(os.path.join(raw_dir, '*.csv')):
        print(f"Processing file: {fp}")
        
        # 데이터 로드
        df_raw = pd.read_csv(fp)
        
        # 필요한 랜드마크만 필터링
        cols = ['frame']
        for lm in cfg['landmarks']:
            cols += [f'x{lm}', f'y{lm}', f'z{lm}']
        
        if not all(col in df_raw.columns for col in cols):
            print(f"Warning: Missing columns in {fp}")
            continue
            
        df_filt = df_raw[cols]
        
        # 특징 추출 (임계값 검사 없이)
        feat_df = extract_features(
            df_filt,
            cfg['features'],
            calibration=cfg.get('calibration', {}),
            z_scale=cfg.get('z_scale', 1.0)
        )
        
        # 특징과 임계값 비교 분석
        analysis_results = {}
        for k, v in thresholds.items():
            if k == 'min_hold_duration_sec':
                continue
                
            # 특징 이름 추출
            if k.startswith('min_'):
                feat_name = k[4:]
                if feat_name in feat_df.columns:
                    passes = (feat_df[feat_name] >= v).sum()
                    total = len(feat_df)
                    pass_percent = (passes / total) * 100 if total > 0 else 0
                    analysis_results[feat_name] = {
                        'threshold_type': 'min',
                        'threshold_value': v,
                        'min': feat_df[feat_name].min(),
                        'max': feat_df[feat_name].max(),
                        'mean': feat_df[feat_name].mean(),
                        'median': feat_df[feat_name].median(),
                        'std': feat_df[feat_name].std(),
                        'passes': passes,
                        'total': total,
                        'pass_percent': pass_percent
                    }
                    print(f"Feature {feat_name}: min={feat_df[feat_name].min():.2f}, max={feat_df[feat_name].max():.2f}, mean={feat_df[feat_name].mean():.2f}")
                    print(f"Threshold min {v}: {passes}/{total} frames pass ({pass_percent:.2f}%)")
            elif k.startswith('max_'):
                feat_name = k[4:]
                if feat_name in feat_df.columns:
                    passes = (feat_df[feat_name] <= v).sum()
                    total = len(feat_df)
                    pass_percent = (passes / total) * 100 if total > 0 else 0
                    analysis_results[feat_name] = {
                        'threshold_type': 'max',
                        'threshold_value': v,
                        'min': feat_df[feat_name].min(),
                        'max': feat_df[feat_name].max(),
                        'mean': feat_df[feat_name].mean(),
                        'median': feat_df[feat_name].median(),
                        'std': feat_df[feat_name].std(),
                        'passes': passes,
                        'total': total,
                        'pass_percent': pass_percent
                    }
                    print(f"Feature {feat_name}: min={feat_df[feat_name].min():.2f}, max={feat_df[feat_name].max():.2f}, mean={feat_df[feat_name].mean():.2f}")
                    print(f"Threshold max {v}: {passes}/{total} frames pass ({pass_percent:.2f}%)")
        
        # 결과 저장
        base_name = os.path.splitext(os.path.basename(fp))[0]
        
        # 특징 데이터 저장
        feat_output = os.path.join(output_dir, f"{base_name}_features.csv")
        feat_df.to_csv(feat_output, index=False)
        print(f"Saved features to {feat_output}")
        
        # 분석 결과 저장
        analysis_df = pd.DataFrame.from_dict(analysis_results, orient='index')
        analysis_output = os.path.join(output_dir, f"{base_name}_analysis.csv")
        analysis_df.to_csv(analysis_output)
        print(f"Saved analysis to {analysis_output}")
        
        # Z축과 각도 간의 상관관계 분석 (특별히 가슴_T자 스트레칭용)
        if 'left_elbow_angle' in feat_df.columns and 'left_elbow_z' in feat_df.columns:
            plt.figure(figsize=(10, 6))
            plt.scatter(feat_df['left_elbow_z'], feat_df['left_elbow_angle'], alpha=0.5)
            plt.axhline(y=thresholds.get('min_left_elbow_angle', 160), color='r', linestyle='--', label=f"Min Angle Threshold: {thresholds.get('min_left_elbow_angle', 160)}")
            plt.axvline(x=thresholds.get('max_left_elbow_z', -0.05), color='g', linestyle='--', label=f"Max Z Threshold: {thresholds.get('max_left_elbow_z', -0.05)}")
            plt.xlabel('Left Elbow Z')
            plt.ylabel('Left Elbow Angle')
            plt.title('Left Elbow Z vs Angle')
            plt.legend()
            plt.grid(True)
            plt.savefig(os.path.join(output_dir, f"{base_name}_left_elbow_correlation.png"))
            
            # 오른쪽도 확인
            plt.figure(figsize=(10, 6))
            plt.scatter(feat_df['right_elbow_z'], feat_df['right_elbow_angle'], alpha=0.5)
            plt.axhline(y=thresholds.get('min_right_elbow_angle', 160), color='r', linestyle='--', label=f"Min Angle Threshold: {thresholds.get('min_right_elbow_angle', 160)}")
            plt.axvline(x=thresholds.get('max_right_elbow_z', -0.05), color='g', linestyle='--', label=f"Max Z Threshold: {thresholds.get('max_right_elbow_z', -0.05)}")
            plt.xlabel('Right Elbow Z')
            plt.ylabel('Right Elbow Angle')
            plt.title('Right Elbow Z vs Angle')
            plt.legend()
            plt.grid(True)
            plt.savefig(os.path.join(output_dir, f"{base_name}_right_elbow_correlation.png"))
        
        # Z값 보정 테스트: 다양한 z_scale 값 시도
        z_scales = [0.8, 0.9, 1.0, 1.1, 1.2, 1.3, 1.4, 1.5]
        z_scale_results = {}
        
        for z_scale in z_scales:
            # 다른 z_scale로 특징 다시 추출
            feat_z_df = extract_features(
                df_filt,
                cfg['features'],
                calibration=cfg.get('calibration', {}),
                z_scale=z_scale
            )
            
            if 'left_elbow_angle' in feat_z_df.columns:
                left_angle_pass = (feat_z_df['left_elbow_angle'] >= thresholds.get('min_left_elbow_angle', 160)).sum()
                left_angle_percent = (left_angle_pass / len(feat_z_df)) * 100
            else:
                left_angle_pass = 0
                left_angle_percent = 0
                
            if 'right_elbow_angle' in feat_z_df.columns:
                right_angle_pass = (feat_z_df['right_elbow_angle'] >= thresholds.get('min_right_elbow_angle', 160)).sum()
                right_angle_percent = (right_angle_pass / len(feat_z_df)) * 100
            else:
                right_angle_pass = 0
                right_angle_percent = 0
                
            z_scale_results[z_scale] = {
                'left_angle_pass_percent': left_angle_percent,
                'right_angle_pass_percent': right_angle_percent
            }
        
        # z_scale 결과 저장
        z_scale_df = pd.DataFrame.from_dict(z_scale_results, orient='index')
        z_scale_output = os.path.join(output_dir, f"{base_name}_z_scale_test.csv")
        z_scale_df.to_csv(z_scale_output)
        print(f"Saved z_scale test results to {z_scale_output}")

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Analyze features without threshold filtering')
    parser.add_argument('--exercise', required=True, help='Exercise name (e.g. 가슴_T자)')
    parser.add_argument('--output_dir', default='data/analysis', help='Output directory for analysis files')
    args = parser.parse_args()
    
    analyze_features(args.exercise, args.output_dir)