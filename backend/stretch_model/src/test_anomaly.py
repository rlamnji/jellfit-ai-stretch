#!/usr/bin/env python3
import os
import sys
import argparse
import pandas as pd
import numpy as np
import joblib
from utils import load_config

FEATURE_DIR = os.path.join('data', 'features')
CONFIG_DIR  = 'config'
MODEL_DIR   = 'models'

def test_anomaly_detector(exercise: str, test_file: str):
    """
    exercise: 스트레칭 이름 (config/<exercise>.yaml)
    test_file: 테스트할 feature 파일 경로
    """
    # 1) 설정 불러오기
    cfg_path = os.path.join(CONFIG_DIR, f'{exercise}.yaml')
    cfg = load_config(cfg_path)

    # 2) 테스트 데이터 로드
    if not os.path.exists(test_file):
        print(f"Error: Test file {test_file} not found")
        return
    
    test_df = pd.read_csv(test_file)
    print(f"Loaded test data: {len(test_df)} frames")

    # 3) 파일 이름에서 방향 추출
    file_name = os.path.basename(test_file)
    if '_left_' in file_name:
        direction = 'left'
    elif '_right_' in file_name:
        direction = 'right'
    else:
        direction = None

    # 4) 모델 로드 및 예측
    if direction:
        model_path = os.path.join(MODEL_DIR, f"{exercise}_{direction}_anomaly.joblib")
        scaler_path = os.path.join(MODEL_DIR, f"{exercise}_{direction}_scaler.joblib")
        
        if not os.path.exists(model_path) or not os.path.exists(scaler_path):
            print(f"Error: Model files not found for direction {direction}")
            return
        
        # 모델과 스케일러 로드
        model = joblib.load(model_path)
        scaler = joblib.load(scaler_path)
        
        # 데이터 스케일링
        X = scaler.transform(test_df)
        
        # 이상치 예측 (-1: 이상치, 1: 정상)
        predictions = model.predict(X)
        
        # 결과 출력
        n_anomalies = np.sum(predictions == -1)
        print(f"\nDirection: {direction}")
        print(f"Total frames: {len(predictions)}")
        print(f"Anomaly frames: {n_anomalies}")
        print(f"Anomaly percentage: {n_anomalies/len(predictions)*100:.2f}%")
        
        # 이상치가 있는 프레임 번호 출력
        anomaly_frames = np.where(predictions == -1)[0]
        if len(anomaly_frames) > 0:
            print("\nAnomaly detected in frames:")
            print(anomaly_frames)
    else:
        # 방향 구분 없는 경우
        model_path = os.path.join(MODEL_DIR, f"{exercise}_anomaly.joblib")
        scaler_path = os.path.join(MODEL_DIR, f"{exercise}_scaler.joblib")
        
        if not os.path.exists(model_path) or not os.path.exists(scaler_path):
            print("Error: Model files not found")
            return
        
        # 모델과 스케일러 로드
        model = joblib.load(model_path)
        scaler = joblib.load(scaler_path)
        
        # 데이터 스케일링
        X = scaler.transform(test_df)
        
        # 이상치 예측 (-1: 이상치, 1: 정상)
        predictions = model.predict(X)
        
        # 결과 출력
        n_anomalies = np.sum(predictions == -1)
        print(f"\nTotal frames: {len(predictions)}")
        print(f"Anomaly frames: {n_anomalies}")
        print(f"Anomaly percentage: {n_anomalies/len(predictions)*100:.2f}%")
        
        # 이상치가 있는 프레임 번호 출력
        anomaly_frames = np.where(predictions == -1)[0]
        if len(anomaly_frames) > 0:
            print("\nAnomaly detected in frames:")
            print(anomaly_frames)

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Test anomaly detection model')
    parser.add_argument('--exercise', required=True,
                      help='Exercise name (config/<exercise>.yaml)')
    parser.add_argument('--test-file', required=True,
                      help='Path to test feature file')
    args = parser.parse_args()

    test_anomaly_detector(args.exercise, args.test_file) 