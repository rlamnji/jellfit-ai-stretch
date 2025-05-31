# 즐겨찾기 항목 등록
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db.database import get_db
from db.models import FavPose, User, UsageRecord
from dependencies import get_current_user
from typing import List
from pydantic import BaseModel

router = APIRouter()

# 요청
class FavPoseRequest(BaseModel):
    pose_id: List[int]

@router.post("/favorites")
def post_fav_poses(
    pose_req: FavPoseRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    ids = pose_req.pose_id
    user_id = current_user.user_id
    created = []


    for pose_id in pose_req.pose_id: 
        exists = db.query(FavPose).filter_by(
            user_id=user_id, pose_id=pose_id
        ).first()

        if not exists:
            entry = FavPose(user_id=user_id, pose_id=pose_id)
            db.add(entry)
            created.append(pose_id)

    db.commit()

    return {"registered": created}


# 즐겨찾기 삭제
@router.delete("/favorites/{pose_id}")
def delete_favorite(pose_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    fav = db.query(FavPose).filter_by(user_id=current_user.user_id, pose_id=pose_id).first()
    if not fav:
        raise HTTPException(status_code=404, detail="즐겨찾기 항목 없음")
    db.delete(fav)
    db.commit()
    return {"detail": "삭제 완료"}
