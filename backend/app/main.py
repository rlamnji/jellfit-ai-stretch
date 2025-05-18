from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.get import get_poses, get_characters, get_user
from app.post import post_poses
from app.auth import login, signup
from app.get_image import get_stretching_image
from app.friends import add_friend, search_friends, accept, reject, confirm_requests
from app.guide import select_poses, get_stretching


#디버깅
from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from db.database import get_db
from db.models import User

app = FastAPI()

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 개발 환경에서만 사용, 프로덕션에서는 특정 도메인으로 변경
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(get_poses.router, tags=["Pose"])
app.include_router(get_characters.router, tags=["Character"]) 
app.include_router(get_user.router)
app.include_router(post_poses.router, tags=["Pose_Analyze"])
app.include_router(login.router)
app.include_router(signup.router)
app.include_router(get_stretching_image.router)
app.include_router(add_friend.router)
app.include_router(search_friends.router)
app.include_router(accept.router)
app.include_router(reject.router)
app.include_router(confirm_requests.router)
app.include_router(select_poses.router)
app.include_router(get_stretching.router)

# 디버깅
@app.get("/test/users")
def test_get_users(db: Session = Depends(get_db)):
    return db.query(User).all()
