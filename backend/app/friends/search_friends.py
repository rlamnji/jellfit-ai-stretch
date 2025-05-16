from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy.sql import or_
from pydantic import BaseModel
from typing import List
from db.models import User, Friend
from db.database import get_db
from dependencies import get_current_user  # 이 부분 추가
import random

router = APIRouter(prefix="/users", tags=["Users"])

# 응답 스키마
class UserResponse(BaseModel):
    user_id: int
    username: str
    introduction: str

    class Config:
        orm_mode = True

class FriendRecordResponse(BaseModel):
    friend_id: int
    requester_id: int
    receiver_id: int
    accepted: bool

    class Config:
        orm_mode = True

@router.get("/print", response_model=List[FriendRecordResponse])
def print_all_friend_records(db: Session = Depends(get_db)):
    all_friends = db.query(Friend).all()
    return all_friends

@router.get("/search", response_model=List[UserResponse])
def search_users(
    nickname: str = Query(..., description="검색할 닉네임 부분 문자열"),
    db: Session = Depends(get_db)
):
    users = db.query(User).filter(User.username.contains(nickname)).all()

    if not users:
        raise HTTPException(status_code=404, detail="No matching users found")

    return users

@router.get("/recommend", response_model=List[UserResponse])
def recommend_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)  # 로그인 유저 판별
):
    current_user_id = current_user.user_id

    # 1. 이미 친구인 유저 id 목록 조회
    friends = db.query(Friend).filter(
        or_(
            Friend.requester_id == current_user_id,
            Friend.receiver_id == current_user_id
        ),
        Friend.accepted == True
    ).all()

    friend_ids = set()
    for f in friends:
        if f.requester_id != current_user_id:
            friend_ids.add(f.requester_id)
        if f.receiver_id != current_user_id:
            friend_ids.add(f.receiver_id)

    # 2. 자신 + 친구 제외한 유저 목록
    candidates = db.query(User).filter(
        ~User.user_id.in_(friend_ids),
        User.user_id != current_user_id
    ).all()

    # 3. 랜덤으로 최대 5명 추천
    recommended = random.sample(candidates, min(5, len(candidates)))

    return recommended
