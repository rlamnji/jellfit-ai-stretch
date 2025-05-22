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
    exercise: 스트레칭 이름 (config/<exercise>.yaml)
    fps: 분할 함수에 사용할 프레임 레이트
    """
    # 1) 설정 불러오기
    cfg_path = os.path.join(CONFIG_DIR, f'{exercise}.yaml')
    cfg = load_config(cfg_path)

    # 2) exercise 디렉토리의 모든 feature 파일 찾기
    feat_dir = os.path.join(FEATURE_DIR, exercise)
    if not os.path.exists(feat_dir):
        print(f"Error: No feature directory found for {exercise}")
        return

    # 3) 방향 설정 확인
    direction = cfg.get('direction', None)
    if direction:
        # 방향별로 별도 모델 학습
        for dir_name in direction.keys():
            # 해당 방향의 모든 피처 파일 찾기
            dir_feat_files = glob.glob(os.path.join(feat_dir, f'*_{dir_name}_hold*_features.csv'))
            
            if dir_feat_files:
                print(f"Found {len(dir_feat_files)} files for direction {dir_name}")
                # 모든 파일의 데이터 합치기
                dfs = []
                for file in dir_feat_files:
                    df = pd.read_csv(file)
                    dfs.append(df)
                dir_df = pd.concat(dfs, ignore_index=True)
                
                # 스케일링
                scaler = StandardScaler()
                X = scaler.fit_transform(dir_df)
                
                # 이상치 탐지 모델 학습
                model = IsolationForest(contamination=0.1, random_state=42)
                model.fit(X)
                
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
        # 모든 피처 파일 찾기
        feat_files = glob.glob(os.path.join(feat_dir, '*_hold*_features.csv'))
        
        if feat_files:
            print(f"Found {len(feat_files)} files")
            # 모든 파일의 데이터 합치기
            dfs = []
            for file in feat_files:
                df = pd.read_csv(file)
                dfs.append(df)
            df_feat = pd.concat(dfs, ignore_index=True)
            
            # 스케일링
            scaler = StandardScaler()
            X = scaler.fit_transform(df_feat)
            
            # 이상치 탐지 모델 학습
            model = IsolationForest(contamination=0.1, random_state=42)
            model.fit(X)
            
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
    parser = argparse.ArgumentParser(description='Train anomaly detection model')
    parser.add_argument('--exercise', required=True,
                      help='Exercise name (config/<exercise>.yaml)')
    parser.add_argument('--fps', type=int, default=30,
                      help='Frames per second (default: 30)')
    args = parser.parse_args()

    # 모델 디렉토리 생성
    os.makedirs(MODEL_DIR, exist_ok=True)

    # 모델 학습
    train_anomaly_detector(args.exercise, args.fps)
