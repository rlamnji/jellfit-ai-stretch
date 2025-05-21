# 친구 목록 삭제 (친구인 상태에서)
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from db.models import Friend, User
from db.database import get_db
from dependencies import get_current_user

from sqlalchemy import or_, and_

router = APIRouter(prefix="/friends", tags=["Friends"])

@router.delete("/{friend_id}")
def delete_friend(
    friend_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # 자기자신 삭제 시도
    if current_user.user_id == friend_id:
        raise HTTPException(status_code=400, detail="You can't delete yourself.")

    # 친구 관계 찾기
    friend = db.query(Friend).filter(
        or_(
            and_(
                Friend.requester_id == current_user.user_id,
                Friend.receiver_id == friend_id
            ),
            and_(
                Friend.requester_id == friend_id,
                Friend.receiver_id == current_user.user_id
            )
        ),
        Friend.accepted==True
    ).first()


    if not friend:
        raise HTTPException(status_code=404, detail="친구 관계를 찾을 수 없습니다.")
    
    db.delete(friend)
    db.commit()

    return {"msg": "친구목록에서 삭제되었습니다.", "friend": friend}
