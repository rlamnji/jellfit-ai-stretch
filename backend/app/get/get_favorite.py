from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import select
from db.database import SessionLocal
from db.models import FavPose, User, Pose
from dependencies import get_current_user
from pydantic import BaseModel
from typing import List

router = APIRouter()

# DB 세션 의존성
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 응답
class FavPoseResponse(BaseModel):
    fav_pose_id: int
    user_id: int
    pose_id: int
    name: str

    class Config:
        orm_mode = True

# 즐겨찾기 조회
@router.get("/favorites", response_model=List[FavPoseResponse])
def get_my_fav_poses(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    results = (
        db.query(
            FavPose.fav_pose_id,
            FavPose.user_id,
            FavPose.pose_id,
            Pose.name 
        )
        .join(Pose, FavPose.pose_id == Pose.pose_id)
        .filter(FavPose.user_id == current_user.user_id)
        .all()
    )

    # SQLAlchemy Row → dict로 변환
    return [dict(row._mapping) for row in results]