# 캘리브레이션 자세 측정
import os
from datetime import datetime
from fastapi import APIRouter, UploadFile, File
from fastapi.responses import JSONResponse

router = APIRouter()

UPLOAD_DIR = "./calibration_images"

@router.post("/analyze")
async def analyze_image(file: UploadFile = File(...)):
    content = await file.read()

    # 이미지 파일 저장
    # 정자세, T자 자세 캡쳐본(2장)이 /backend/calibration_images 폴더에 생기게 해놨으요
    os.makedirs(UPLOAD_DIR, exist_ok=True)

    # 파일명에 타임스탬프 추가
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S_%f")
    file_ext = os.path.splitext(file.filename)[1]  # .jpg, .png 등
    new_filename = f"{timestamp}{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, new_filename)

    with open(file_path, "wb") as f:
        f.write(content)


    print(f"📸 이미지 수신 완료: {len(content)} bytes, filename={file.filename}")
    return JSONResponse(content={"result": "received", "filename": file.filename})
