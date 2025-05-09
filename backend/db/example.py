import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(os.path.dirname(__file__))))

from sqlalchemy.orm import Session
from db.database import SessionLocal
from db.models import User

def get_all_users():
    db: Session = SessionLocal()
    users = db.query(User).all()
    db.close()
    return users

if __name__ == "__main__":
    users = get_all_users()
    for user in users:
        print(f"ID: {user.id}, Username: {user.username}, Introduction: {user.introduction}")
