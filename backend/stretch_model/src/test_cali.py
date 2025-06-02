#!/usr/bin/env python3
import numpy as np
import pandas as pd
import json
import os
from pathlib import Path
from typing import Dict, List, Optional
from datetime import datetime
from .utils import load_config, extract_features
import yaml

class TestCalibrationProcessor:
    """
    테스트용 캘리브레이션 시스템 - 기존 CSV 파일 사용
    """
    
    def __init__(self):
        # 특징 정의 로드
        self.feature_config = self.load_feature_config()
        
    def load_feature_config(self):
        """캘리브레이션 특징 정의 로드"""
        config_path = Path("config") / "calibration_features.yaml"
        if config_path.exists():
            with open(config_path, 'r', encoding='utf-8') as f:
                return yaml.safe_load(f)
        else:
            # 기본 특징 정의 (파일이 없는 경우)
            return {
                'features': [
                    {
                        'name': 'neutral_left_eye_ear_y_diff',
                        'type': 'delta_y',
                        'source_pose': 'neutral',
                        'points': [2, 7],
                        'description': '중립시 왼쪽 눈-귀 Y차이'
                    },
                    {
                        'name': 'neutral_right_eye_ear_y_diff',
                        'type': 'delta_y',
                        'source_pose': 'neutral',
                        'points': [5, 8],
                        'description': '중립시 오른쪽 눈-귀 Y차이'
                    },
                    {
                        'name': 'face_x_spread',
                        'type': 'spread_x',
                        'source_pose': 'neutral',
                        'points': [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
                        'description': '얼굴 랜드마크들의 x좌표 분산도'
                    }
                ],
                'computed_features': []
            }
    
    def process_test_files(self, data_directory: str = "data") -> Dict:
        """
        테스트 파일들을 처리하여 캘리브레이션 수행
        
        Args:
            data_directory: 데이터 파일들이 있는 디렉토리
            
        Returns:
            캘리브레이션 결과 딕셔너리
        """
        data_dir = Path(data_directory)
        
        # 파일 패턴에 맞는 파일들 찾기
        file_pattern = "Cali_가슴_T자_*_1_landmarks.csv"
        files = list(data_dir.glob(file_pattern))
        
        if not files:
            print(f"Error: No files found matching pattern {file_pattern} in {data_dir}")
            return {'success': False, 'message': '테스트 파일을 찾을 수 없습니다.'}
        
        print(f"Found {len(files)} calibration files:")
        for f in files:
            print(f"  - {f.name}")
        
        # 각 파일별로 처리
        all_data = []
        for file_path in files:
            try:
                # 사람 번호 추출
                person_id = self.extract_person_id(file_path.name)
                
                # CSV 파일 로드
                df = pd.read_csv(file_path)
                
                # 단일 프레임인지 확인
                if len(df) == 1:
                    landmarks_dict = df.iloc[0].to_dict()
                    landmarks_dict['person_id'] = person_id
                    all_data.append(landmarks_dict)
                    print(f"Loaded data for person {person_id}")
                else:
                    print(f"Warning: File {file_path.name} has {len(df)} frames, using first frame only")
                    landmarks_dict = df.iloc[0].to_dict()
                    landmarks_dict['person_id'] = person_id
                    all_data.append(landmarks_dict)
                    
            except Exception as e:
                print(f"Error processing {file_path.name}: {e}")
                continue
        
        if not all_data:
            return {'success': False, 'message': '유효한 데이터를 로드할 수 없습니다.'}
        
        # DataFrame으로 변환
        df_all = pd.DataFrame(all_data)
        
        # 특징 추출
        features = self.extract_calibration_features(df_all)
        
        # 캘리브레이션 데이터 구성
        calibration_data = {
            'timestamp': datetime.now().isoformat(),
            'test_mode': True,
            'person_count': len(all_data),
            'features': features,
            'raw_data': all_data
        }
        
        # 저장
        self.save_calibration(calibration_data)
        
        return {
            'success': True,
            'message': f'{len(all_data)}명의 캘리브레이션 완료!',
            'features': features
        }
    
    def extract_person_id(self, filename: str) -> str:
        """파일명에서 사람 번호 추출"""
        # Cali_가슴_T자_<번호>_1_landmarks.csv 형태에서 번호 추출
        parts = filename.split('_')
        if len(parts) >= 4:
            return parts[3]  # <번호> 부분
        return "unknown"
    
    def extract_calibration_features(self, df: pd.DataFrame) -> Dict:
        """캘리브레이션 특징 추출 - 정의된 3개 특징만 계산"""
        features = {}
        
        # 각 사람별로 특징 계산
        person_features = {}
        
        for _, row in df.iterrows():
            person_id = row['person_id']
            
            # 단일 행을 DataFrame으로 변환
            person_df = pd.DataFrame([row])
            
            # extract_features 함수 사용
            feature_defs = self.feature_config['features']
            feat_df = extract_features(person_df, feature_defs)
            
            # 결과 저장
            person_feats = feat_df.iloc[0].to_dict()
            person_features[person_id] = person_feats
            
            print(f"Person {person_id} features:")
            for feat_name, feat_value in person_feats.items():
                print(f"  {feat_name}: {feat_value:.6f}")
        
        features['individual_features'] = person_features
        
        return features
    
    def save_calibration(self, calibration_data: Dict):
        """기본 캘리브레이션 데이터 저장 (기존 호환성 유지)"""
        output_dir = Path("data/calibration")
        output_dir.mkdir(parents=True, exist_ok=True)
        
        # JSON 저장
        json_path = output_dir / "test_calibration_results.json"
        with open(json_path, 'w', encoding='utf-8') as f:
            json.dump(calibration_data, f, indent=2, ensure_ascii=False, default=str)
        
        print(f"기본 결과 저장: {json_path}")


def save_calibration_results(features: Dict, save_directory: str = "data/calibration"):
    """
    캘리브레이션 결과를 다양한 형태로 저장
    
    Args:
        features: 캘리브레이션 특징 데이터
        save_directory: 저장할 디렉토리 경로
    """
    save_dir = Path(save_directory)
    save_dir.mkdir(parents=True, exist_ok=True)
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    
    # 1. 전체 결과를 JSON으로 저장
    json_path = save_dir / f"calibration_results_{timestamp}.json"
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(features, f, indent=2, ensure_ascii=False, default=str)
    print(f"전체 결과 저장: {json_path}")
    
    # 2. 개별 특징값을 CSV로 저장 (표 형태)
    if 'individual_features' in features:
        individual_data = []
        for person_id, person_features in features['individual_features'].items():
            row = {'person_id': person_id}
            row.update(person_features)
            individual_data.append(row)
        
        if individual_data:
            df_individual = pd.DataFrame(individual_data)
            csv_path = save_dir / f"calibration_individual_{timestamp}.csv"
            df_individual.to_csv(csv_path, index=False)
            print(f"개별 특징값 CSV 저장: {csv_path}")
    
    # 3. 캘리브레이션 설정 파일 생성 (YAML 형태)
    if 'individual_features' in features:
        # 첫 번째 사람의 데이터를 기준으로 캘리브레이션 설정 생성
        first_person_data = list(features['individual_features'].values())[0]
        
        calibration_config = {
            'calibration': first_person_data,
            'generated_at': datetime.now().isoformat(),
            'source': 'test_calibration'
        }
        
        yaml_path = save_dir / f"calibration_config_{timestamp}.yaml"
        with open(yaml_path, 'w', encoding='utf-8') as f:
            yaml.dump(calibration_config, f, default_flow_style=False, allow_unicode=True)
        print(f"캘리브레이션 설정 저장: {yaml_path}")
    
    # 4. 간단한 텍스트 요약 저장
    summary_path = save_dir / f"calibration_summary_{timestamp}.txt"
    with open(summary_path, 'w', encoding='utf-8') as f:
        f.write("=== 캘리브레이션 결과 요약 ===\n\n")
        f.write(f"생성 시간: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        f.write(f"참여자 수: {len(features.get('individual_features', {}))}\n\n")
        
        if 'individual_features' in features:
            for person_id, person_features in features['individual_features'].items():
                f.write(f"참여자 {person_id}:\n")
                for feat_name, feat_value in person_features.items():
                    f.write(f"  {feat_name}: {feat_value:.6f}\n")
                f.write("\n")
    
    print(f"요약 텍스트 저장: {summary_path}")
    
    return {
        'json_path': str(json_path),
        'csv_path': str(csv_path) if 'csv_path' in locals() else None,
        'yaml_path': str(yaml_path) if 'yaml_path' in locals() else None,
        'summary_path': str(summary_path)
    }


def main():
    """테스트 캘리브레이션 실행"""
    processor = TestCalibrationProcessor()
    
    # 데이터 디렉토리 지정 (필요시 수정)
    data_directory = "data/cali_frames/cali_가슴_T자"  # 또는 실제 파일이 있는 경로
    
    result = processor.process_test_files(data_directory)
    
    if result['success']:
        print("\n=== 캘리브레이션 완료 ===")
        print(result['message'])
        
        # 주요 특징값들 출력
        if 'features' in result and 'individual_features' in result['features']:
            print("\n=== 주요 특징값 요약 ===")
            individual_features = result['features']['individual_features']
            
            for person_id, person_features in individual_features.items():
                print(f"\n참여자 {person_id}:")
                for feat_name, feat_value in person_features.items():
                    print(f"  {feat_name}: {feat_value:.6f}")
        
        # 결과 저장
        print("\n=== 결과 저장 중 ===")
        save_directory = input("저장할 디렉토리 경로를 입력하세요 (기본값: data/calibration): ").strip()
        if not save_directory:
            save_directory = "data/calibration"
        
        saved_files = save_calibration_results(result['features'], save_directory)
        
        print("\n=== 저장 완료 ===")
        print("저장된 파일들:")
        for file_type, file_path in saved_files.items():
            if file_path:
                print(f"  {file_type}: {file_path}")
                
    else:
        print(f"캘리브레이션 실패: {result['message']}")


if __name__ == '__main__':
    main()