from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from db.models import Friend, User
from db.database import get_db
from dependencies import get_current_user  # 추가
from typing import List
from pydantic import BaseModel

router = APIRouter(prefix="/friends", tags=["Friends"])

class FriendRequestResponse(BaseModel):
    user_id: int
    username: str
    introduction: str

    class Config:
        orm_mode = True

@router.get("/requests", response_model=List[FriendRequestResponse])
def get_friend_requests(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)  # access token 기반 로그인 유저
):
    current_user_id = current_user.user_id

    # 1. 받은 친구요청 중 수락하지 않은 요청 조회
    pending_requests = db.query(Friend).filter(
        Friend.receiver_id == current_user_id,
        Friend.accepted == False
    ).all()

    # 2. 요청을 보낸 유저 정보 추출
    requester_ids = [req.requester_id for req in pending_requests]
    requesters = db.query(User).filter(User.user_id.in_(requester_ids)).all()

    return requesters
