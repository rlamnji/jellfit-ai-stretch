from fastapi import APIRouter, UploadFile, File
from app.posture_ai.model import predict_posture
import cv2
import numpy as np
import mediapipe as mp
import joblib  # ← 추가
import os

router = APIRouter()

# 미디어파이프 초기화
mp_pose = mp.solutions.pose.Pose(static_image_mode=True)

# 상체 관절 인덱스
landmark_indices = [0, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 23, 24]
cols = []
for i in landmark_indices:
    cols.extend([i * 3, i * 3 + 1, i * 3 + 2])

# 전처리 기준 불러오기
scaler_path = "models/scaler.pkl"
if not os.path.exists(scaler_path):
    raise FileNotFoundError("전처리 기준 파일이 존재하지 않습니다: models/scaler.pkl")

scaler = joblib.load(scaler_path)

# 전처리 함수
def preprocess_landmarks(raw_landmarks: list[float]) -> list[float]:
    upper_body = np.array(raw_landmarks)[cols].reshape(1, -1)
    return scaler.transform(upper_body)[0]  # 저장된 기준으로만 transform!


# 이미지에서 pose 좌표 추출
def extract_pose_landmarks(image_bytes: bytes) -> list[float] | None:
    np_array = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(np_array, cv2.IMREAD_COLOR)

    result = mp_pose.process(cv2.cvtColor(img, cv2.COLOR_BGR2RGB))

    if not result.pose_landmarks:
        return None

    landmarks = result.pose_landmarks.landmark
    return [coord for lm in landmarks for coord in (lm.x, lm.y, lm.z)]


@router.post("/posture/predict")
async def predict_pose(file: UploadFile = File(...)):
    image_bytes = await file.read()
    raw_landmarks = extract_pose_landmarks(image_bytes)

    if raw_landmarks is None:
        return {"result": 0, "msg": "포즈를 감지할 수 없습니다."}

    features = preprocess_landmarks(raw_landmarks)
    result = predict_posture(features)

    return {"postureCode": result}
# 0 (unknown)  1 (좋은 자세) 2 (나쁜 자세)