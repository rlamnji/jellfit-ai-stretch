from fastapi import Header, APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db.database import get_db
from db.models import User
from pydantic import BaseModel
from typing import Optional
from passlib.context import CryptContext
from dependencies import get_current_user

router = APIRouter()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# 스키마 (change pwd)
class UserPwdUpdateSchema(BaseModel):
    pwd_current: str # 현재 비번
    pwd_new: str # 새 비번
    pwd_confirm: str # 새 비번 확인

    class Config:
        orm_mode = True

# 스키마 (user detail update)
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


# 비밀 번호 수정
@router.patch("/change-password")
def change_user_pwd(
    user_pwd_change: UserPwdUpdateSchema,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    user = current_user
    
    # 현재 비밀번호가 맞는지 확인
    if not pwd_context.verify(user_pwd_change.pwd_current, user.password):
        raise HTTPException(status_code=400, detail="현재 비밀번호 불일치")

    # pwd_new와 pwd_confirm이 맞는지 확인
    if user_pwd_change.pwd_new != user_pwd_change.pwd_confirm:
        raise HTTPException(status_code=400, detail="새 비밀번호와 불일치")
    
    user.password = pwd_context.hash(user_pwd_change.pwd_new)

    db.commit()
    db.refresh(user)

    return {"message": "비밀번호가 성공적으로 변경되었습니다."}