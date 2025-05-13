from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional

from db.models import Pose, Category  # Category 모델도 필요
from db.database import get_db  # SQLAlchemy 세션 의존성

router = APIRouter(prefix = "/guide/select", tags=["Guide"])

# 요청 body용 스키마 (요청이 아래대로 안오면 422 에러 발생)
class CategoryRequest(BaseModel):
    categoryName: str

# 응답용 스키마
class PoseResponse(BaseModel):
    id: int
    name: str
    imgURL: Optional[str]
    videoURL: Optional[str]

@router.post("", response_model=List[PoseResponse])
def select_poses_by_category(request: CategoryRequest, db: Session = Depends(get_db)):
    # 1. 카테고리 이름으로 category_id 조회
    category = db.query(Category).filter(Category.name == request.categoryName).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    # 2. 해당 category_id를 가진 포즈 목록 조회
    poses = db.query(Pose).filter(Pose.category_id == category.category_id).all()
    
    # 3. 응답 형식에 맞게 변환
    return [
        PoseResponse(
            id=pose.pose_id,
            name=pose.name,
            imgURL=pose.thumbnail_url,
            videoURL=pose.video_url
        )
        for pose in poses
    ]
