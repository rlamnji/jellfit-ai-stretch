#!/usr/bin/env python3
import os
import pandas as pd
import glob
import argparse

def analyze_z_coordinates(input_folder, output_folder):
   """
   캘리브레이션 이미지들에서 어깨와 손목의 Z좌표를 분석
   
   Args:
       input_folder: 랜드마크 CSV 파일들이 있는 폴더
       output_folder: 분석 결과를 저장할 폴더
   """
   
   # 출력 폴더 생성
   os.makedirs(output_folder, exist_ok=True)
   
   # 랜드마크 CSV 파일 찾기
   pattern = os.path.join(input_folder, "Cali_가슴_T자_*_landmarks.csv")
   csv_files = glob.glob(pattern)
   
   if not csv_files:
       print(f"No calibration CSV files found in {input_folder}")
       return
   
   print(f"Found {len(csv_files)} CSV files")
   
   # 파일명에서 번호와 자세 추출
   file_info = {}
   for file_path in csv_files:
       filename = os.path.basename(file_path)
       # Cali_가슴_T자_1_0_landmarks.csv -> 번호=1, 자세=0
       parts = filename.replace('_landmarks.csv', '').split('_')
       if len(parts) >= 5:
           try:
               person_num = int(parts[3])  # 번호
               pose_type = int(parts[4])  # 자세 (0, 1, 2)
               
               if person_num not in file_info:
                   file_info[person_num] = {}
               
               file_info[person_num][pose_type] = file_path
           except ValueError:
               print(f"Warning: Could not parse filename {filename}")
               continue
   
   print(f"Found data for {len(file_info)} people")
   
   # 각 사람별로 분석
   all_results = []
   
   for person_num in sorted(file_info.keys()):
       print(f"\nProcessing person {person_num}")
       
       person_data = {
           'person': person_num,
           'left_shoulder_z_normal': None, 'left_shoulder_z_back': None, 'left_shoulder_z_front': None,
           'right_shoulder_z_normal': None, 'right_shoulder_z_back': None, 'right_shoulder_z_front': None,
           'left_wrist_z_normal': None, 'left_wrist_z_back': None, 'left_wrist_z_front': None,
           'right_wrist_z_normal': None, 'right_wrist_z_back': None, 'right_wrist_z_front': None
       }
       
       pose_labels = {0: 'normal', 1: 'back', 2: 'front'}
       
       for pose_type, file_path in file_info[person_num].items():
           if pose_type in pose_labels:
               try:
                   df = pd.read_csv(file_path)
                   
                   # 어깨와 손목의 Z좌표 추출
                   left_shoulder_z = df['z11'].iloc[0] if 'z11' in df.columns else None
                   right_shoulder_z = df['z12'].iloc[0] if 'z12' in df.columns else None
                   left_wrist_z = df['z15'].iloc[0] if 'z15' in df.columns else None
                   right_wrist_z = df['z16'].iloc[0] if 'z16' in df.columns else None
                   
                   pose_label = pose_labels[pose_type]
                   
                   person_data[f'left_shoulder_z_{pose_label}'] = left_shoulder_z
                   person_data[f'right_shoulder_z_{pose_label}'] = right_shoulder_z
                   person_data[f'left_wrist_z_{pose_label}'] = left_wrist_z
                   person_data[f'right_wrist_z_{pose_label}'] = right_wrist_z
                   
                   print(f"  Pose {pose_type} ({pose_label}): L_shoulder={left_shoulder_z:.4f}, R_shoulder={right_shoulder_z:.4f}, L_wrist={left_wrist_z:.4f}, R_wrist={right_wrist_z:.4f}")
                   
               except Exception as e:
                   print(f"  Error reading {file_path}: {e}")
       
       all_results.append(person_data)
   
   # 전체 결과를 DataFrame으로 변환
   results_df = pd.DataFrame(all_results)
   
   # 결과 저장
   output_file = os.path.join(output_folder, "z_coordinate_analysis.csv")
   results_df.to_csv(output_file, index=False, encoding='utf-8')
   print(f"\nResults saved to: {output_file}")
   
   # 추가 분석: 자세별 차이 계산
   analysis_data = []
   
   for _, row in results_df.iterrows():
       person = row['person']
       
       # 왼쪽 손목의 자세별 차이 (normal 기준)
       if pd.notna(row['left_wrist_z_normal']):
           left_wrist_back_diff = row['left_wrist_z_back'] - row['left_wrist_z_normal'] if pd.notna(row['left_wrist_z_back']) else None
           left_wrist_front_diff = row['left_wrist_z_front'] - row['left_wrist_z_normal'] if pd.notna(row['left_wrist_z_front']) else None
       else:
           left_wrist_back_diff = None
           left_wrist_front_diff = None
       
       # 오른쪽 손목의 자세별 차이 (normal 기준)
       if pd.notna(row['right_wrist_z_normal']):
           right_wrist_back_diff = row['right_wrist_z_back'] - row['right_wrist_z_normal'] if pd.notna(row['right_wrist_z_back']) else None
           right_wrist_front_diff = row['right_wrist_z_front'] - row['right_wrist_z_normal'] if pd.notna(row['right_wrist_z_front']) else None
       else:
           right_wrist_back_diff = None
           right_wrist_front_diff = None
       
       analysis_data.append({
           'person': person,
           'left_wrist_back_diff': left_wrist_back_diff,
           'left_wrist_front_diff': left_wrist_front_diff,
           'right_wrist_back_diff': right_wrist_back_diff,
           'right_wrist_front_diff': right_wrist_front_diff
       })
   
   # 차이 분석 결과 저장
   diff_df = pd.DataFrame(analysis_data)
   diff_output_file = os.path.join(output_folder, "z_coordinate_differences.csv")
   diff_df.to_csv(diff_output_file, index=False, encoding='utf-8')
   print(f"Difference analysis saved to: {diff_output_file}")
   
   # 요약 통계
   print(f"\n=== Summary Statistics ===")
   for col in ['left_wrist_back_diff', 'left_wrist_front_diff', 'right_wrist_back_diff', 'right_wrist_front_diff']:
       valid_data = diff_df[col].dropna()
       if len(valid_data) > 0:
           print(f"{col}: mean={valid_data.mean():.4f}, std={valid_data.std():.4f}, min={valid_data.min():.4f}, max={valid_data.max():.4f}")
       else:
           print(f"{col}: No valid data")

def main():
   parser = argparse.ArgumentParser(description='Analyze Z coordinates from calibration images')
   parser.add_argument('--input', '-i', required=True,
                       help='Input folder containing landmark CSV files')
   parser.add_argument('--output', '-o', required=True,
                       help='Output folder for analysis results')
   args = parser.parse_args()
   
   # 입력 폴더 존재 확인
   if not os.path.exists(args.input):
       print(f"Error: Input folder '{args.input}' does not exist")
       return
   
   # Z좌표 분석 실행
   analyze_z_coordinates(args.input, args.output)

if __name__ == '__main__':
   main()