from fastapi import APIRouter, Depends
from dependencies import get_current_user
from db.models import User


router = APIRouter(prefix="/auth", tags=["Login"])


@router.post("/logout")
def logout(current_user: User = Depends(get_current_user)):
    return {"message": f"User {current_user.username} 로그아웃 성공"}


