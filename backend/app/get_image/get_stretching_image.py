from pydantic import BaseModel
from typing import Union, Optional
from fastapi import APIRouter, UploadFile, File, HTTPException, Form, Depends
from fastapi.responses import JSONResponse
import numpy as np
import cv2
from stretch_model.src.infer_anomaly import StretchTracker
from sqlalchemy.orm import Session
from db.database import get_db
from db.models import User, Pose
# from dependencies import get_current_user

router = APIRouter(prefix="/guide/analyze", tags=["Stretching_Analyze"])

class StretchingAnalyzeResult(BaseModel):
    name: str
    currentSide: Optional[str] = None  # None 허용
    count: int
    elapsedTime: float
    isCompleted: bool
    feedbackMsg: Union[str, list[str]]
    feedbackType: Union[str, list[str]]

# pose_id에 따른 StretchTracker 모델 이름 매핑
POSE_ID_TO_EXERCISE = {
    1: "등_팔꿈치",
    2: "가슴_T자",
    3: "가슴_Y자",
    4: "등_날개뼈",
    5: "등_위",
    6: "어깨_겨드랑이",
    7: "어깨_십자",
    8: "목_젖히기"
}

# pose_id에 따른 이상치 임계값 설정
POSE_ID_TO_OUTLIER_THRESHOLD = {
    1: -0.25,  # 등_팔꿈치
    2: -0.1,   # 가슴_T자
    3: -0.1,  # 가슴_Y자
    4: -0.1,  # 가슴_Y자
    5: -0.2,   # 등_위
    6: -0.2,   # 등_앞
    7: -0.2,   # 등_날개뼈
    8: -0.3,   # 목_날개뼈
    9: -0.25,  # 어깨_겨드랑이
    10: -0.2   # 어깨_팔꿈치
}

tracker_cache = {}
def get_tracker(exercise_name: str) -> StretchTracker:
    """exercise 이름에 맞는 Tracker를 반환 (캐싱 방식)"""
    if exercise_name not in tracker_cache:
        tracker_cache[exercise_name] = StretchTracker(exercise=exercise_name)
    return tracker_cache[exercise_name]

@router.post("")
async def analyze_image(
    file: UploadFile = File(...),
    pose_id: int = Form(None or 7),
    db: Session = Depends(get_db),
    # current_user: User = Depends(get_current_user)
):
    content = await file.read()
    image_array = np.asarray(bytearray(content), dtype=np.uint8)
    image = cv2.imdecode(image_array, cv2.IMREAD_COLOR)

    pose = db.query(Pose).filter(Pose.pose_id == pose_id).first()
    if not pose:
        raise HTTPException(status_code=404, detail="Pose not found")

    exercise = POSE_ID_TO_EXERCISE.get(pose_id)
    tracker = get_tracker(exercise or "등_위")
    outlier_threshold = POSE_ID_TO_OUTLIER_THRESHOLD.get(pose_id, -0.2)
    result = tracker.is_performing(image, outlier_threshold=outlier_threshold)
    print("get_stretching_image에서 is_performing 사용 결과:", result)

    return StretchingAnalyzeResult(
        name=result.get("exercise", '정보없음'),
        currentSide=result.get("current_side") or "정보없음",  # None 방지
        elapsedTime=result.get("elapsed_time", 0),
        count=list(result.get("counts", {None: 0}).values())[0],  # ✅ dict → int 값만 추출
        isCompleted=bool(result.get("completed", False)),
        feedbackMsg=result.get("feedback_messages", '정보없음'),
        feedbackType=result.get("feedback_type", '정보없음')
    )
