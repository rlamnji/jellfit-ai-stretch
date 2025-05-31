# 즐겨찾기 테이블 조회
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from db.database import SessionLocal
from db.models import FavPose
from dependencies import get_current_user  # access token 인증
from typing import List

router = APIRouter()

# DB 세션 의존성
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 전체 캐릭터
@router.get("/favorites", response_model=List[dict])
def get_all_fav(db: Session = Depends(get_db)):
    fav_poses = db.query(FavPose).all()
    return [
        {
            "fav_pose_id": c.fav_pose_id,
            "user_id": c.user_id,
            "pose_id": c.pose_id

        } for c in fav_poses
    ]