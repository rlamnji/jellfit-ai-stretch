from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db.models import Friend, User
from db.database import get_db
from dependencies import get_current_user  # access token 인증
from pydantic import BaseModel

router = APIRouter(prefix="/friends", tags=["Friends"])

class AcceptFriendRequest(BaseModel):
    requester_id: int

@router.post("/accept")
def accept_friend_request(
    request: AcceptFriendRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)  # 토큰으로 로그인 유저 확인
):
    current_user_id = current_user.user_id

    # 1. 요청 검색
    friend_request = db.query(Friend).filter(
        Friend.requester_id == request.requester_id,
        Friend.receiver_id == current_user_id,
        Friend.accepted == False
    ).first()

    if not friend_request:
        raise HTTPException(status_code=404, detail="친구 요청이 존재하지 않거나 이미 수락됨")

    # 2. 요청 수락
    friend_request.accepted = True
    db.commit()

    return {"message": "친구 요청을 수락했습니다."}
