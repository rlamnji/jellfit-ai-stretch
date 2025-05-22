from fastapi import APIRouter, UploadFile, File, HTTPException, Form
from fastapi.responses import JSONResponse
# from PIL import Image
# import io
# import os
# from datetime import datetime
import numpy as np
import cv2
from stretch_model.src.infer_anomaly import StretchTracker

router = APIRouter(prefix="/guide/analyze", tags=["Stretching_Analyze"])

IMAGE_DIR = "./app/get_image/guide_images"

tracker_cache = {}
def get_tracker(exercise_name: str) -> StretchTracker:
    """exercise 이름에 맞는 Tracker를 반환 (캐싱 방식)"""
    if exercise_name not in tracker_cache:
        tracker_cache[exercise_name] = StretchTracker(exercise=exercise_name)
    return tracker_cache[exercise_name]


@router.post("")
async def analyze_image(file: UploadFile = File(...), exercise: str = Form(...)):
    '''운동 이름에 맞는 Tracker를 불러와서 이미지 분석 후 결과 반환'''
    try:
        content = await file.read()
        image_array = np.asarray(bytearray(content), dtype=np.uint8)
        image = cv2.imdecode(image_array, cv2.IMREAD_COLOR)

        if image is None:
            raise HTTPException(status_code=400, detail="이미지를 디코딩할 수 없습니다.")
        
        # exercise에 맞는 Tracker 불러오기
        tracker = get_tracker(exercise)

        # 모델 추론
        result = tracker.is_performing(image)

        return JSONResponse(content={
            "exercise": exercise,
            "result": result
        })

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    # content = await file.read()

    # # 이미지 파일 저장
    # # 스트레칭 가이드 0.3초 간격 프레임이 /backend/app/get_image/guide_images 폴더에 생김
    # os.makedirs(IMAGE_DIR, exist_ok=True)

    # # 파일명에 타임스탬프 추가
    # timestamp = datetime.now().strftime("%Y%m%d_%H%M%S_%f")
    # file_ext = os.path.splitext(file.filename)[1]  # .jpg, .png 등
    # new_filename = f"{timestamp}{file_ext}"
    # file_path = os.path.join(IMAGE_DIR, new_filename)

    # with open(file_path, "wb") as f:
    #     f.write(content)

    # print(f"📸 이미지 수신 완료: {len(content)} bytes, filename={file.filename}")

    # return JSONResponse(content={"result": "received", "filename": file.filename})
