from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from datetime import datetime
from dotenv import load_dotenv
import os

from db.database import get_db
from db.models import User

# .env 파일 로드
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '../../.env'))

# 환경변수에서 설정값 로드
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-here")
ALGORITHM = os.getenv("ALGORITHM", "HS256")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login/")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        print("Token received:", token)
        print("SECRET_KEY:", SECRET_KEY)
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        print("Decoded payload:", payload)
        user_id: str = payload.get("sub")
        
        print("User ID from payload:", user_id)
        if user_id is None:
            raise credentials_exception
    except JWTError:
        print("JWT Error:", str(JWTError))
        raise credentials_exception
    
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise credentials_exception
    return user
