#!/usr/bin/env python3
import os
import sys
import argparse
import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
import joblib
import glob

from utils import load_config

FEATURE_DIR = os.path.join('data', 'features')
CONFIG_DIR  = 'config'
MODEL_DIR   = 'models'

def train_anomaly_detector(exercise: str, fps: int = 30):
    """
    hold 타입 스트레칭을 위한 프레임별 이상치 탐지 모델 학습
    
    Args:
        exercise: 스트레칭 이름
        fps: 프레임 레이트 (사용하지 않지만 호환성 유지)
    """
    # 1) 설정 불러오기
    cfg_path = os.path.join(CONFIG_DIR, f'{exercise}.yaml')
    cfg = load_config(cfg_path)
    
    # hold 타입인지 확인
    cycles_cfg = cfg.get('cycles', {})
    if cycles_cfg.get('type') != 'hold':
        print(f"Warning: {exercise} is not a hold-type exercise. Skipping...")
        return

    # 2) feature 디렉토리 확인
    feat_dir = os.path.join(FEATURE_DIR, exercise)
    if not os.path.exists(feat_dir):
        print(f"Error: No feature directory found for {exercise}")
        return

    # 3) 방향 설정 확인
    direction = cfg.get('direction', None)
    
    if direction:
        # 방향별로 별도 모델 학습
        for dir_name in direction.keys():
            print(f"\n=== Training model for {exercise} - {dir_name} direction ===")
            
            # 해당 방향의 모든 피처 파일 찾기
            dir_feat_files = glob.glob(os.path.join(feat_dir, f'*_{dir_name}_hold*_features.csv'))
            
            if dir_feat_files:
                print(f"Found {len(dir_feat_files)} files for direction {dir_name}")
                
                # 프레임별 데이터 수집
                all_frames = []
                total_segments = 0
                
                for file in dir_feat_files:
                    df = pd.read_csv(file)
                    print(f"  Processing {file}: {len(df)} frames")
                    
                    # 각 프레임을 개별 샘플로 처리
                    for _, row in df.iterrows():
                        all_frames.append(row.values)
                    
                    total_segments += 1
                
                if len(all_frames) < 10:
                    print(f"Warning: Too few frames ({len(all_frames)}) for direction {dir_name}")
                    continue
                
                print(f"Total frames collected: {len(all_frames)} from {total_segments} segments")
                
                # 데이터 준비
                X = np.array(all_frames)
                print(f"Training data shape: {X.shape}")
                
                # 스케일링
                scaler = StandardScaler()
                X_scaled = scaler.fit_transform(X)
                
                # 이상치 탐지 모델 학습 (프레임별)
                contamination = min(0.1, max(0.01, 1.0 / len(all_frames)))  # 적응적 contamination
                model = IsolationForest(
                    contamination=contamination, 
                    random_state=42,
                    n_estimators=100
                )
                model.fit(X_scaled)
                
                # 모델 평가 (학습 데이터에서)
                scores = model.decision_function(X_scaled)
                predictions = model.predict(X_scaled)
                inlier_ratio = (predictions == 1).mean()
                
                print(f"Model training completed:")
                print(f"  Inlier ratio: {inlier_ratio:.3f}")
                print(f"  Score range: {scores.min():.3f} ~ {scores.max():.3f}")
                
                # 모델 저장
                model_name = f"{exercise}_{dir_name}_anomaly.joblib"
                scaler_name = f"{exercise}_{dir_name}_scaler.joblib"
                
                joblib.dump(model, os.path.join(MODEL_DIR, model_name))
                joblib.dump(scaler, os.path.join(MODEL_DIR, scaler_name))
                
                print(f"Saved model: {model_name}")
                print(f"Saved scaler: {scaler_name}")
                
            else:
                print(f"Warning: No feature files found for direction {dir_name}")
    else:
        # 방향 구분 없는 경우
        print(f"\n=== Training model for {exercise} (no direction) ===")
        
        # 모든 피처 파일 찾기
        feat_files = glob.glob(os.path.join(feat_dir, '*_hold*_features.csv'))
        
        if feat_files:
            print(f"Found {len(feat_files)} files")
            
            # 프레임별 데이터 수집
            all_frames = []
            total_segments = 0
            
            for file in feat_files:
                df = pd.read_csv(file)
                print(f"  Processing {file}: {len(df)} frames")
                
                # 각 프레임을 개별 샘플로 처리
                for _, row in df.iterrows():
                    all_frames.append(row.values)
                
                total_segments += 1
            
            if len(all_frames) < 10:
                print(f"Warning: Too few frames ({len(all_frames)}) for training")
                return
            
            print(f"Total frames collected: {len(all_frames)} from {total_segments} segments")
            
            # 데이터 준비
            X = np.array(all_frames)
            print(f"Training data shape: {X.shape}")
            
            # 스케일링
            scaler = StandardScaler()
            X_scaled = scaler.fit_transform(X)
            
            # 이상치 탐지 모델 학습
            contamination = min(0.1, max(0.01, 1.0 / len(all_frames)))
            model = IsolationForest(
                contamination=contamination, 
                random_state=42,
                n_estimators=100
            )
            model.fit(X_scaled)
            
            # 모델 평가
            scores = model.decision_function(X_scaled)
            predictions = model.predict(X_scaled)
            inlier_ratio = (predictions == 1).mean()
            
            print(f"Model training completed:")
            print(f"  Inlier ratio: {inlier_ratio:.3f}")
            print(f"  Score range: {scores.min():.3f} ~ {scores.max():.3f}")
            
            # 모델 저장
            model_name = f"{exercise}_anomaly.joblib"
            scaler_name = f"{exercise}_scaler.joblib"
            
            joblib.dump(model, os.path.join(MODEL_DIR, model_name))
            joblib.dump(scaler, os.path.join(MODEL_DIR, scaler_name))
            
            print(f"Saved model: {model_name}")
            print(f"Saved scaler: {scaler_name}")
        else:
            print(f"Warning: No feature files found for {exercise}")


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Train frame-based anomaly detection model')
    parser.add_argument('--exercise', required=True,
                      help='Exercise name (config/<exercise>.yaml)')
    parser.add_argument('--fps', type=int, default=30,
                      help='Frames per second (default: 30)')
    args = parser.parse_args()

    # 모델 디렉토리 생성
    os.makedirs(MODEL_DIR, exist_ok=True)

    # 모델 학습
    train_anomaly_detector(args.exercise, args.fps)