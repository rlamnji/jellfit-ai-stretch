from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from db.database import get_db
from db.models import Friend
from dependencies import get_current_user

router = APIRouter(prefix="/friends", tags=["Friends"])

class RejectRequest(BaseModel):
    requester_id: int

@router.post("/reject")
def reject_friend_request(request: RejectRequest, db: Session = Depends(get_db), current_user: int = Depends(get_current_user)):
    
    current_user_id = current_user.user_id
    
    friend = db.query(Friend).filter(
        Friend.requester_id == request.requester_id,
        Friend.receiver_id == current_user_id,
        Friend.accepted == False
    ).first()

    if not friend:
        raise HTTPException(status_code=404, detail="친구 요청을 찾을 수 없습니다.")

    db.delete(friend)
    db.commit()

    return {"message": "친구 요청을 거절하였습니다."}
