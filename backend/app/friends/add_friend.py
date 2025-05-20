from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from db.models import Friend, User
from db.database import get_db
from dependencies import get_current_user

from sqlalchemy import or_, and_

router = APIRouter(prefix="/friends", tags=["Friends"])

# 요청 스키마: 닉네임 대신 receiver_id를 직접 받음
class FriendRequest(BaseModel):
    receiver_id: int  # 친구 요청 받을 유저 ID

# 응답 스키마
class FriendResponse(BaseModel):
    friend_id: int
    requester_id: int
    receiver_id: int
    accepted: bool

    class Config:
        orm_mode = True

@router.post("", response_model=FriendResponse)
def send_friend_request(
    request: FriendRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # 본인에게 친구 요청 불가
    if current_user.user_id == request.receiver_id:
        raise HTTPException(status_code=400, detail="You can't add yourself.")

    # 수신자 존재 여부 확인
    receiver = db.query(User).filter(User.user_id == request.receiver_id).first()
    if not receiver:
        raise HTTPException(status_code=404, detail="Receiver not found")

    # 중복 요청/이미 친구 여부 확인
    existing = db.query(Friend).filter(
        or_(
            and_(
                Friend.requester_id == current_user.user_id,
                Friend.receiver_id == receiver.user_id
            ),
            and_(
                Friend.requester_id == receiver.user_id,
                Friend.receiver_id == current_user.user_id
            )
        )
    ).first()

    if existing:
        if existing.accepted:
            raise HTTPException(status_code=400, detail="이미 친구입니다.")
        else:
            raise HTTPException(status_code=400, detail="이미 친구 요청이 존재합니다.")
    
    # 친구 요청 생성
    new_request = Friend(
        requester_id=current_user.user_id,
        receiver_id=receiver.user_id,
        accepted=False
    )
    db.add(new_request)
    db.commit()
    db.refresh(new_request)

    return new_request
