from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db.database import get_db
from db.models import User
from pydantic import BaseModel
from typing import Optional

router = APIRouter()

class UserUpdateSchema(BaseModel):
    username: Optional[str]
    introduction: Optional[str]
    profile_url: Optional[str]

    class Config:
        orm_mode = True

# 사용자 정보 수정
@router.patch("/{user_id}/change-detail")
def change_user_detail(
    user_id: int,
    user_update: UserUpdateSchema,
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.user_id==user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user_update.username is not None:
        user.username = user_update.username
    if user_update.introduction is not None:
        user.introduction = user_update.introduction
    if user_update.profile_url is not None:
        user.profile_url = user_update.profile_url

    db.commit()
    db.refresh(user)

    return user
