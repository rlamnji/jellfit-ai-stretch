from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from .login import create_access_token

from db.database import get_db
from db.models import User
from pydantic import BaseModel

class UserCreate(BaseModel):
    nickname: str
    id: str
    password: str

router = APIRouter(prefix="/auth", tags=["Auth"])
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

@router.post("/join", status_code=status.HTTP_201_CREATED)
def join(user_in: UserCreate, db: Session = Depends(get_db)):
    # 1) ID 중복 확인
    if db.query(User).filter(User.id == user_in.id).first():
        raise HTTPException(status_code=400, detail="이미 사용 중인 ID입니다.")

    # 2) 비밀번호 해싱
    hashed_pw = pwd_context.hash(user_in.password)

    # 3) 새 유저 생성 및 저장
    new_user = User(
        username=user_in.nickname,
        id=user_in.id,
        password=hashed_pw,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    access_token = create_access_token(data={"sub": new_user.id})

    return {"msg": "회원가입 성공", "userId": new_user.user_id, "access_token": access_token}
