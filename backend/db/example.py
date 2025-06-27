import sys
import os
# sys, os 사용하는 건 db.models import할 때 쓰는 상대 경로임. 다른 파일에서 import 할 때는 절대 경로로 바꿔줘야 함.
sys.path.append(os.path.dirname(os.path.abspath(os.path.dirname(__file__))))

from sqlalchemy.orm import Session
from db.database import SessionLocal
from db.models import User, Character, Pose

def get_all_users():
    db: Session = SessionLocal()
    users = db.query(User).all()
    db.close()
    return users

def get_all_characters():
    db: Session = SessionLocal()
    characters = db.query(Character).all()
    db.close()
    return characters

def get_all_poses():
    db: Session = SessionLocal()
    poses = db.query(Pose).all()
    db.close()
    return poses

if __name__ == "__main__":
    users = get_all_users()
    for user in users:
        print(f"ID: {user.id}, Username: {user.username}, Introduction: {user.introduction}")
    
    characters = get_all_characters()
    for character in characters:
        print(f"ID: {character.character_id}, Name: {character.name}, Description: {character.description}")

    poses = get_all_poses()
    for pose in poses:
        print(f"ID: {pose.pose_id}, Name: {pose.name}, Description: {pose.description}")
