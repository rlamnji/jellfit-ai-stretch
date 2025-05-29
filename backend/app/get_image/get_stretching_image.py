from fastapi import APIRouter, UploadFile, File, HTTPException, Form, Depends
from fastapi.responses import JSONResponse
import numpy as np
import cv2
from stretch_model.src.infer_anomaly import StretchTracker
from sqlalchemy.orm import Session
from db.database import get_db
from db.models import User, Pose
# from dependencies import get_current_user
#from app.get_image.manager import stretch_session_manager


router = APIRouter(prefix="/guide/analyze", tags=["Stretching_Analyze"])

# pose_id에 따른 StretchTracker 모델 이름 매핑
POSE_ID_TO_EXERCISE = {
    1: "손목_돌리기",
    2: "등_팔꿈치", # 아직 수정 안함 # 팔꿈치굽혀서옆구리늘리기
    3: "가슴_T자",
    4: "가슴_Y자",
    5: "등_날개뼈", # 아직 수정 안함 # 손걸고잡아당기기
    6: "등_앞", # 팔앞으로쭉뻗기
    7: "등_위", # 팔뻗고옆구리늘리기
    8: "목_날개뼈", # 아직 수정 안함 # 목뒤로젖히기
    9: "어깨_겨드랑이", # 아직 수정 안함 # 겨드랑이향하여목당기기
    10: "어깨_팔꿈치" # 아직 수정 안함 #팔꿈치바깥으로회전하기
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
    #current_user: User = Depends(get_current_user)
):
    content = await file.read()
    image_array = np.asarray(bytearray(content), dtype=np.uint8)
    image = cv2.imdecode(image_array, cv2.IMREAD_COLOR)

    pose = db.query(Pose).filter(Pose.pose_id == pose_id).first()
    if not pose:
        raise HTTPException(status_code=404, detail="Pose not found")

    exercise = POSE_ID_TO_EXERCISE.get(pose_id)
    tracker = get_tracker(exercise or "등_위")
    result = tracker.is_performing(image)
    print("get_stretching_image에서 is_performing 사용 결과:", result)

    return {"completed": bool(result.get("completed", False))}
