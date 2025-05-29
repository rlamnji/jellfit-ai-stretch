# 캘리브레이션 자세 측정
import os
import glob
import tempfile
import mediapipe as mp
import cv2
import pandas as pd

from fastapi import APIRouter, UploadFile, File, FastAPI, Form
from fastapi.responses import JSONResponse
from stretch_model.src.calibrate import calibrate

router = APIRouter()

# csv로 추출 함수 ????
def extract_landmarks_to_csv(image_path: str, csv_path: str):
    mp_pose = mp.solutions.pose
    pose = mp_pose.Pose(static_image_mode=True)
    img = cv2.imread(image_path)

    if img is None:
        raise ValueError("Image could not be read.")

    result = pose.process(cv2.cvtColor(img, cv2.COLOR_BGR2RGB))
    if not result.pose_landmarks:
        raise ValueError("No landmarks detected.")

    data = {}
    for i, lm in enumerate(result.pose_landmarks.landmark[:23]):
        data[f'x{i}'] = lm.x
        data[f'y{i}'] = lm.y
        data[f'z{i}'] = lm.z

    df = pd.DataFrame([data])
    df.to_csv(csv_path, index=False)


# 이미지 파일 받아서 csv 파일로 변환
@router.post("/analyze")
async def analyze_image(
    file: UploadFile = File(...), 
    pose_type: str = Form(...)
):
    content = await file.read()

    # csv 저장
    csv_dir = f"./calibration_data/{pose_type}"
    os.makedirs(csv_dir, exist_ok=True)

    # jpg 저장
    save_dir = f"./calibration_image/{pose_type}"
    os.makedirs(save_dir, exist_ok=True)

    # csv 저장 타입 (posture_001.csv)
    existing_files = sorted(glob.glob(os.path.join(csv_dir, f"{pose_type}_*.csv")))
    next_index = len(existing_files) + 1
    base_filename = f"{pose_type}_{next_index:03d}"

    # jpg 저장 타입 (posture_001.jpg)
    img_path = os.path.join(save_dir, base_filename + ".jpg")
    with open(img_path, "wb") as f:
        f.write(content)

    # Mediapipe landmark 추출
    csv_path = os.path.join(csv_dir, base_filename + ".csv")
    try:
        extract_landmarks_to_csv(img_path, csv_path)
        #os.remove(img_path)  # 이미지 파일은 사용 후 삭제
    except Exception as e:
        #os.remove(img_path)
        return JSONResponse(status_code=500, content={"error": str(e)})
    

    print(f"CSV 저장 완료: {csv_path}")
    return JSONResponse(content={
        "result": "received", 
        "filename": file.filename, 
        "pose_type": pose_type, 
        "csv_path": csv_path
    })


# calibrate.py로 보내기
#@router.get("/calibrate")
#def run_calibration():
#   
# 