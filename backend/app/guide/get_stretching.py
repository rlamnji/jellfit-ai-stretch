from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional

from db.models import Pose
from db.database import get_db

router = APIRouter(prefix="/guide/stretching", tags=["Guide"])

# 응답 스키마
class StretchingDetail(BaseModel):
    name: str
    time: Optional[int]
    repeatCount: Optional[int]
    videoURL: Optional[str]

@router.get("/{stretchingId}", response_model=StretchingDetail)
def get_stretching_detail(stretchingId: int, db: Session = Depends(get_db)):
    pose = db.query(Pose).filter(Pose.pose_id == stretchingId).first()
    if not pose:
        raise HTTPException(status_code=404, detail="Pose not found")

    return StretchingDetail(
        name=pose.name,
        time=pose.duration,
        repeatCount=pose.count,
        videoURL=pose.video_url
    )
