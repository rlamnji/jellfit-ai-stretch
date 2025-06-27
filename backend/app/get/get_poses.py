from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.orm import Session
from db.database import SessionLocal
from db.models import Pose
from typing import List

from fastapi.responses import JSONResponse


router = APIRouter()

# DB 세션 의존성
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/poses", response_model=List[dict])
def get_all_poses(db: Session = Depends(get_db)):
    poses = db.query(Pose).all()
    return [
        {
            "pose_id": p.pose_id,
            "name": p.name,
            "duration": p.duration,
            "count": p.count,
            "video_url": p.video_url,
            "thumbnail_url": p.thumbnail_url,
            "category_id": p.category_id
        } for p in poses
    ]
