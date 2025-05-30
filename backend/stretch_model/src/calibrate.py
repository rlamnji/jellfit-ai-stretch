#!/usr/bin/env python3
import numpy as np
import pandas as pd
import json
import os
from pathlib import Path
from typing import Dict, List, Optional
from datetime import datetime
from utils import load_config, extract_features, segment_holds
import yaml
import cv2
import mediapipe as mp

class CalibrationProcessor:
    """
    YAML 기반 캘리브레이션 시스템
    """
    
    def __init__(self):
        # MediaPipe 초기화
        self.mp_pose = mp.solutions.pose
        self.pose = self.mp_pose.Pose(
            static_image_mode=True,
            model_complexity=2,
            enable_segmentation=False,
            min_detection_confidence=0.5
        )
        
        # 설정 로드
        self.pose_configs = {}
        self.load_calibration_configs()
        
        # 특징 정의 로드
        self.feature_config = self.load_feature_config()
        
        # 활성 세션들
        self.sessions = {}
        
    def load_calibration_configs(self):
        """캘리브레이션용 YAML 설정들 로드"""
        config_dir = Path("config")
        
        # 각 자세별 설정 로드
        for pose_name in ['neutral', 'tpose']:
            config_path = config_dir / f"calibration_{pose_name}.yaml"
            if config_path.exists():
                self.pose_configs[pose_name] = load_config(str(config_path))
            else:
                raise FileNotFoundError(f"캘리브레이션 설정 파일 없음: {config_path}")
                
    def load_feature_config(self):
        """캘리브레이션 특징 정의 로드"""
        config_path = Path("config") / "calibration_features.yaml"
        if config_path.exists():
            with open(config_path, 'r', encoding='utf-8') as f:
                return yaml.safe_load(f)
        else:
            raise FileNotFoundError(f"특징 정의 파일 없음: {config_path}")
    
    # (05.30) csv 상태에서 코드 받도록 수정할 것
    # 여기부터 수정
    def start_session(self, user_id: str) -> Dict:
        """캘리브레이션 세션 시작"""
        self.sessions[user_id] = {
            'user_id': user_id,
            'timestamp': datetime.now().isoformat(),
            'current_pose': 'neutral',
            'collected_frames': {
                'neutral': [],
                'tpose': []
            },
            'status': 'collecting_neutral'
        }
        
        return {
            'success': True,
            'message': f'{user_id} 캘리브레이션 시작',
            'current_pose': 'neutral',
            'target_frames': self.pose_configs['neutral']['cycles']['target_frames']
        }
    
    def process_frame(self, user_id: str, image: np.ndarray) -> Dict:
        """프레임 처리"""
        if user_id not in self.sessions:
            return {'success': False, 'message': '세션이 없습니다.'}
        
        session = self.sessions[user_id]
        current_pose = session['current_pose']
        
        # 랜드마크 추출
        landmarks_dict = self.extract_landmarks(image)
        if not landmarks_dict:
            return {
                'success': False,
                'message': '포즈를 감지할 수 없습니다.',
                'current_pose': current_pose
            }
        
        # DataFrame으로 변환하여 기존 시스템과 호환
        df = pd.DataFrame([landmarks_dict])
        
        # 특징 추출
        config = self.pose_configs[current_pose]
        feat_df = extract_features(df, config['features'])
        
        # 임계값 검사
        is_valid = self.check_pose_validity(feat_df, config['thresholds'])
        
        if is_valid:
            # 유효한 프레임 추가
            session['collected_frames'][current_pose].append(landmarks_dict)
            collected_count = len(session['collected_frames'][current_pose])
            target_count = config['cycles']['target_frames']
            
            # 목표 달성 확인
            if collected_count >= target_count:
                if current_pose == 'neutral':
                    # 다음 자세로 이동
                    session['current_pose'] = 'tpose'
                    session['status'] = 'collecting_tpose'
                    
                    return {
                        'success': True,
                        'message': 'neutral 완료! T자세로 이동',
                        'pose_completed': 'neutral',
                        'current_pose': 'tpose',
                        'target_frames': self.pose_configs['tpose']['cycles']['target_frames']
                    }
                else:
                    # 캘리브레이션 완료
                    return self.finalize_calibration(user_id)
            
            return {
                'success': True,
                'message': f'{current_pose} 유효 프레임 추가',
                'current_pose': current_pose,
                'collected_frames': collected_count,
                'target_frames': target_count,
                'progress': collected_count / target_count
            }
        else:
            return {
                'success': False,
                'message': f'{current_pose} 자세가 부적절합니다.',
                'current_pose': current_pose,
                'collected_frames': len(session['collected_frames'][current_pose])
            }
    
    def extract_landmarks(self, image: np.ndarray) -> Optional[Dict]:
        """이미지에서 랜드마크 추출"""
        rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        results = self.pose.process(rgb_image)
        
        if not results.pose_landmarks:
            return None
        
        landmarks_dict = {'frame': 0}
        
        for idx in range(23):  # 상체 랜드마크 0-22
            if idx < len(results.pose_landmarks.landmark):
                lm = results.pose_landmarks.landmark[idx]
                landmarks_dict[f'x{idx}'] = lm.x
                landmarks_dict[f'y{idx}'] = lm.y
                landmarks_dict[f'z{idx}'] = lm.z
            else:
                landmarks_dict[f'x{idx}'] = 0.0
                landmarks_dict[f'y{idx}'] = 0.0
                landmarks_dict[f'z{idx}'] = 0.0
        
        return landmarks_dict
    
    def check_pose_validity(self, feat_df: pd.DataFrame, thresholds: Dict) -> bool:
        """임계값 기반 자세 유효성 검사"""
        for threshold_name, threshold_value in thresholds.items():
            if threshold_name in ['min_frames_needed', 'target_frames']:
                continue
                
            feature_name = threshold_name.replace('min_', '').replace('max_', '')
            
            if feature_name not in feat_df.columns:
                continue
                
            feature_value = feat_df[feature_name].iloc[0]
            
            if threshold_name.startswith('min_'):
                if feature_value < threshold_value:
                    return False
            elif threshold_name.startswith('max_'):
                if feature_value > threshold_value:
                    return False
        
        return True
    
    # 해당 함수로 csv 평균값
    def finalize_calibration(self, user_id: str) -> Dict:
        """캘리브레이션 완료 처리"""
        session = self.sessions[user_id]
        
        # 각 자세별 평균 계산 (이상치 제거 포함)
        pose_averages = {}
        for pose_name, frames in session['collected_frames'].items():
            if frames:
                df = pd.DataFrame(frames)
                # 이상치 제거 후 평균 (기존 방식 활용)
                cleaned_data = self.remove_outliers_and_average(df)
                if cleaned_data:
                    pose_averages[pose_name] = cleaned_data
        
        if len(pose_averages) < 2:
            return {'success': False, 'message': '충분한 데이터가 없습니다.'}
        
        # 특징 추출
        features = self.extract_calibration_features(pose_averages)
        
        # 최종 데이터 구성
        calibration_data = {
            'user_id': user_id,
            'timestamp': session['timestamp'],
            'completion_time': datetime.now().isoformat(),
            'pose_data': pose_averages,
            'features': features
        }
        
        # 저장
        self.save_calibration(calibration_data)
        
        # 세션 정리
        del self.sessions[user_id]
        
        return {
            'success': True,
            'message': '캘리브레이션 완료!',
            'features': features
        }
    
    def extract_calibration_features(self, pose_averages: Dict) -> Dict:
        """YAML 정의에 따른 특징 추출"""
        features = {}
        
        # 기본 특징 추출
        for feature_def in self.feature_config['features']:
            feature_name = feature_def['name']
            feature_type = feature_def['type']
            source_pose = feature_def['source_pose']
            points = feature_def['points']
            
            if source_pose not in pose_averages:
                continue
                
            pose_data = pose_averages[source_pose]['landmarks_mean']
            
            if feature_type == 'distance':
                p1 = (pose_data[f'x{points[0]}'], pose_data[f'y{points[0]}'])
                p2 = (pose_data[f'x{points[1]}'], pose_data[f'y{points[1]}'])
                features[feature_name] = np.linalg.norm(np.array(p1) - np.array(p2))
                
            elif feature_type == 'delta_y':
                y1 = pose_data[f'y{points[0]}']
                y2 = pose_data[f'y{points[1]}']
                features[feature_name] = y1 - y2
        
        # 계산된 특징들
        for computed_def in self.feature_config['computed_features']:
            comp_name = computed_def['name']
            comp_type = computed_def['type']
            
            if comp_type == 'average':
                source_features = computed_def['source_features']
                if all(f in features for f in source_features):
                    features[comp_name] = np.mean([features[f] for f in source_features])
                    
            elif comp_type == 'ratio':
                numerator = computed_def['numerator']
                denominator = computed_def['denominator']
                if numerator in features and denominator in features:
                    features[comp_name] = features[numerator] / features[denominator]
        
        return features
    
    def remove_outliers_and_average(self, df: pd.DataFrame) -> Optional[Dict]:
        """이상치 제거 후 평균 계산"""
        if len(df) < 10:
            return None
        
        # IQR 방법으로 이상치 제거
        outlier_mask = np.zeros(len(df), dtype=bool)
        
        for idx in range(23):
            for coord in ['x', 'y', 'z']:
                col = f'{coord}{idx}'
                if col in df.columns:
                    values = df[col].values
                    Q1 = np.percentile(values, 25)
                    Q3 = np.percentile(values, 75)
                    IQR = Q3 - Q1
                    
                    lower_bound = Q1 - 1.5 * IQR
                    upper_bound = Q3 + 1.5 * IQR
                    
                    outliers = (values < lower_bound) | (values > upper_bound)
                    outlier_mask |= outliers
        
        clean_df = df[~outlier_mask].copy()
        
        if len(clean_df) < len(df) * 0.5:  # 50% 이상 제거되면 실패
            return None
        
        return {
            'landmarks_mean': clean_df.mean().to_dict(),
            'landmarks_std': clean_df.std().to_dict(),
            'used_frames': len(clean_df),
            'total_frames': len(df)
        }
    
    def save_calibration(self, calibration_data: Dict):
        """캘리브레이션 데이터 저장"""
        user_id = calibration_data['user_id']
        output_dir = Path("data/calibration")
        output_dir.mkdir(parents=True, exist_ok=True)
        
        # JSON 저장
        json_path = output_dir / f"calibration_{user_id}.json"
        with open(json_path, 'w', encoding='utf-8') as f:
            json.dump(calibration_data, f, indent=2, ensure_ascii=False)
        
        # 특징만 CSV로 저장 (DB 연동용)
        features_df = pd.DataFrame([calibration_data['features']])
        features_df['user_id'] = user_id
        features_df['timestamp'] = calibration_data['timestamp']
        
        csv_path = output_dir / f"calibration_features_{user_id}.csv"
        features_df.to_csv(csv_path, index=False)
        
        print(f"캘리브레이션 데이터 저장 완료: {json_path}")