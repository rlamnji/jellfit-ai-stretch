from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from db.models import User
from db.database import get_db
from dependencies import get_current_user  # access token 인증
from pydantic import BaseModel

router = APIRouter(prefix="/get/me", tags=["Users"])

class UserInfoResponse(BaseModel):
    user_id: int
    username: str
    id: str
    introduction: str

    class Config:
        orm_mode = True

@router.get("", response_model=UserInfoResponse)
def get_current_user_info(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return current_user
