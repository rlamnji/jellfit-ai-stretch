from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.get import get_poses, get_characters
from app.post import post_poses
# from app.auth import login //임시!
from app.get_image import get_stretching_image
from app.guide import select_poses, get_stretching

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
app.include_router(post_poses.router, tags=["Pose_Analyze"])
# app.include_router(login.router) //임시!
app.include_router(get_stretching_image.router)
app.include_router(select_poses.router)
app.include_router(get_stretching.router)