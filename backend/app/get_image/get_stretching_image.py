from fastapi import APIRouter, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from PIL import Image
import io
import os
from datetime import datetime

router = APIRouter(prefix="/guide/analyze", tags=["Stretching_Analyze"])

IMAGE_DIR = "./app/get_image/guide_images"

@router.post("")
async def analyze_image(file: UploadFile = File(...)):
    content = await file.read()

    # 이미지 파일 저장
    # 스트레칭 가이드 0.3초 간격 프레임이 /backend/app/get_image/guide_images 폴더에 생김
    os.makedirs(IMAGE_DIR, exist_ok=True)

    # 파일명에 타임스탬프 추가
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S_%f")
    file_ext = os.path.splitext(file.filename)[1]  # .jpg, .png 등
    new_filename = f"{timestamp}{file_ext}"
    file_path = os.path.join(IMAGE_DIR, new_filename)

    with open(file_path, "wb") as f:
        f.write(content)

    print(f"📸 이미지 수신 완료: {len(content)} bytes, filename={file.filename}")
    return JSONResponse(content={"result": "received", "filename": file.filename})
