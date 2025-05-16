from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from db.models import Friend
from db.database import get_db
from pydantic import BaseModel

router = APIRouter(prefix="/friends", tags=["Friends"])

class AcceptFriendRequest(BaseModel):
    requester_id: int

@router.post("/accept")
def accept_friend_request(
    request: AcceptFriendRequest,
    current_user_id: int = Query(...),  # 로그인 사용자 ID
    db: Session = Depends(get_db)
):
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
