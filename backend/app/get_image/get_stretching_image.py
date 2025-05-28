from fastapi import APIRouter, UploadFile, File, HTTPException, Form, Depends
from fastapi.responses import JSONResponse
import numpy as np
import cv2
from stretch_model.src.infer_anomaly import StretchTracker
from sqlalchemy.orm import Session
from db.database import get_db
from db.models import User, Pose
from dependencies import get_current_user
from app.get_image.manager import stretch_session_manager


router = APIRouter(prefix="/guide/analyze", tags=["Stretching_Analyze"])

# IMAGE_DIR = "./app/get_image/guide_images"

# pose_id에 따른 StretchTracker 모델 이름 매핑
POSE_ID_TO_EXERCISE = {
    1: "손목_돌리기",
    2: "등_팔꿈치",
    3: "가슴_T자",
    4: "가슴_Y자",
    5: "등_날개뼈",
    6: "등_앞",
    7: "등_위",
    8: "목_날개뼈",
    9: "어깨_겨드랑이",
    10: "어깨_팔꿈치"
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
    print("시작")
    print(f"pose_id: {pose_id}")
    content = await file.read()
    image_array = np.asarray(bytearray(content), dtype=np.uint8)
    image = cv2.imdecode(image_array, cv2.IMREAD_COLOR)

    pose = db.query(Pose).filter(Pose.pose_id == pose_id).first()
    if not pose:
        raise HTTPException(status_code=404, detail="Pose not found")

    exercise = POSE_ID_TO_EXERCISE.get(pose_id)
    tracker = get_tracker(exercise or "등_위")
    result = tracker.is_performing(image)

    is_true = result.get("completed", False)
    direction = result.get("current_side", "none")

    dummy_user_id = 1

    session = stretch_session_manager.get_or_create_session(dummy_user_id, pose_id, pose)
    status = session.update(is_true, direction)
    print("들어간 방향", direction)

    # 응답 메시지 구성
    message = None
    
# 동작이 정확하고 아직 세션이 완료되지 않았을 때
    if is_true and not status["completed"]:
        # 목표 횟수에 막 도달한 경우
        if (direction == "right" and status["right_count"] == 5) or \
            (direction == "left" and status["left_count"] == 5):
            message = f"{direction.upper()} 방향 다했어요! 🎉"

        # 중간 진행 상태에 따라 격려 메시지 다양화
        elif (direction == "right" and 1 <= status["right_count"] < 5):
            message = f"오른쪽 {status['right_count']}회! 계속해봐요!"
        elif (direction == "left" and 1 <= status["left_count"] < 5):
            message = f"왼쪽 {status['left_count']}회! 계속해봐요!"

    # 동작이 틀렸고, 어느 쪽이든 시도가 있었던 경우
    elif not is_true and (status["right_count"] > 0 or status["left_count"] > 0):
        # 잘못된 자세일 경우 랜덤한 피드백 메시지들 중 하나 선택 (원하면 random 사용 가능)
        message = "자세가 조금 흐트러졌어요. 다시 집중해볼까요?"

    

    print("==========================")
    print("=API 응답 메시지: ")
    print ("status",status, "message", message)
    print("==========================")

    return {
        "status": status,
        "message": message
    }

    # return {
    #     "pose_id": pose_id,
    #     "is_true": is_true,
    #     "direction": direction,
    #     "message": message,
    #     **status  # merged: elapsed_time or counts + completed
    # }