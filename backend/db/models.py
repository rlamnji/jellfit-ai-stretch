from sqlalchemy import Column, Integer, String, ForeignKey, Boolean, Date, Float, JSON
from sqlalchemy.orm import relationship, declarative_base
from datetime import datetime, timezone

Base = declarative_base()

class User(Base):
    __tablename__ = 'users'

    user_id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String, nullable=False)
    id = Column(String, unique=True)
    password = Column(String, nullable=False)
    introduction = Column(String, default="안녕하세요!")
    profile_url = Column(String, default="/images/profile/profile_1.png")

    # 유저 테이블 관계
    diseases = relationship('UserDisease', back_populates='user')
    records = relationship('UsageRecord', back_populates='user')
    characters = relationship('UserCharacter', back_populates='user')
    friends_sent = relationship('Friend', back_populates='requester', foreign_keys='Friend.requester_id')
    friends_received = relationship('Friend', back_populates='receiver', foreign_keys='Friend.receiver_id')
    routines = relationship("Routine", back_populates="user")
    user_calibrations = relationship("UserCalibration", back_populates="user")
    calibration_landmarks = relationship("UserCalibrationLandmark", back_populates="user")
    fav_poses = relationship('FavPose', back_populates='user')

# 캘리브레이션 종류
class Calibration(Base):
    __tablename__ = 'calibrations'

    calibration_id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, nullable=False, unique=True)

# 사용자의 캘리브레이션 값
class UserCalibration(Base):
    __tablename__ = 'user_calibrations'

    user_calibration_id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey('users.user_id'), nullable=False)
    calibration_id = Column(Integer, ForeignKey('calibrations.calibration_id'), nullable=False)
    value = Column(Float, nullable=False)

    user = relationship("User", back_populates="user_calibrations")
    calibration = relationship("Calibration", backref="user_calibrations")

# 추후 캘리브레이션 종류가 추가되면, 여기서 랜드마크 뽑아서 계산
class UserCalibrationLandmark(Base):
    __tablename__ = 'user_calibration_landmarks'

    user_calibration_landmark_id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey('users.user_id'), nullable=False)
    pose_name = Column(String, nullable=False)  # e.g., 'neutral', 'tpose'
    landmarks = Column(JSON, nullable=False)  # {"x0": 0.1, ..., "z22": -0.3}

    user = relationship("User", back_populates="calibration_landmarks")

# 질병
class Disease(Base):
    __tablename__ = 'diseases'

    disease_id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, nullable=False)

    # 질병 테이블 관계
    users = relationship('UserDisease', back_populates='disease')

# 사용자 질병
class UserDisease(Base):
    __tablename__ = 'user_diseases'

    user_disease_id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey('users.user_id'))
    disease_id = Column(Integer, ForeignKey('diseases.disease_id'))

    # 유저 질병 테이블 관계
    user = relationship('User', back_populates='diseases')
    disease = relationship('Disease', back_populates='users')

# 친구
class Friend(Base):
    __tablename__ = 'friends'

    friend_id = Column(Integer, primary_key=True, autoincrement=True)
    requester_id = Column(Integer, ForeignKey('users.user_id'))
    receiver_id = Column(Integer, ForeignKey('users.user_id'))
    accepted = Column(Boolean, default=False)

    # 친구 요청 테이블 관계
    # 요청한 사람과 수락한 사람 모두 User 테이블의 user_id를 참조
    requester = relationship('User', back_populates='friends_sent', foreign_keys=[requester_id])
    receiver = relationship('User', back_populates='friends_received', foreign_keys=[receiver_id])

# 사용자 스트레칭 기록(횟수)
class UsageRecord(Base):
    __tablename__ = 'usage_records'

    record_id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey('users.user_id'))
    # 자세번호 (추가)
    pose_id = Column(Integer, ForeignKey('poses.pose_id'))
    # 횟수 (추가)
    repeat_cnt = Column(Integer, nullable=False)

    # 유저 사용기록 테이블 관계
    user = relationship('User', back_populates='records')
    pose = relationship('Pose')


# 사용자 스트레칭 기록(시간)
class DailyUsageLog(Base):
    __tablename__ = 'daily_usage_logs'

    log_id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey('users.user_id'), nullable=False)
    date = Column(Date, default=lambda: datetime.now(timezone.utc).date())
    usage_time = Column(Integer, nullable=False)  # 하루 동안의 총 스트레칭 시간 (초)
    

# 사용자 캐릭터
class UserCharacter(Base):
    __tablename__ = 'user_characters'

    user_character_id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey('users.user_id'))
    character_id = Column(Integer, ForeignKey('characters.character_id'))

    # 유저 캐릭터 테이블 관계
    user = relationship('User', back_populates='characters')
    character = relationship('Character', back_populates='user_characters')

# 캐릭터
class Character(Base):
    __tablename__ = 'characters'

    character_id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, nullable=False)
    acquisition_num = Column(Integer, nullable=True) # 캐릭터 획득 횟수, 추후 nullable=False로 변경
    description = Column(String)
    image_url = Column(String)
    pose_id = Column(Integer, ForeignKey('poses.pose_id'))

    # 캐릭터 테이블 관계
    pose = relationship('Pose', back_populates='characters')
    user_characters = relationship('UserCharacter', back_populates='character')

# 자세
class Pose(Base):
    __tablename__ = 'poses'

    pose_id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, nullable=False)
    duration = Column(Integer, nullable=True) # 포즈 지속 시간, 초 단위, 나중에 nullable=False로 변경
    count = Column(Integer, nullable=True) # 포즈 반복 횟수, 나중에 nullable=False로 변경
    video_url = Column(String, nullable=True)
    thumbnail_url = Column(String, nullable=True)
    category_id = Column(Integer, ForeignKey('categories.category_id'))

    # 포즈 테이블 관계
    category = relationship('Category', back_populates='poses')
    characters = relationship('Character', back_populates='pose')
    fav_poses = relationship('RoutinePose', back_populates='pose')


class Category(Base):
    __tablename__ = 'categories'

    category_id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, nullable=False)

    # 카테고리 테이블 관계
    poses = relationship('Pose', back_populates='category')

# 사용자마다 루틴이 여러개일 수 잇으니까~
# 없어질 가능성 100
class Routine(Base):
    __tablename__ = 'routines'

    routine_id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey('users.user_id'), nullable=False) # 루틴 소유자
    image_url = Column(String, nullable=True) # 루틴 이미지 URL, 나중에 nullable=False로 변경

    # 루틴 테이블 관계
    user = relationship("User", back_populates="routines")
    fav_poses = relationship('RoutinePose', back_populates='routine')

# 즐겨찾기 테이블
class FavPose(Base):
    __tablename__ = 'fav_poses'

    fav_pose_id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey('users.user_id'))
    pose_id = Column(Integer, ForeignKey('poses.pose_id'))

    # 즐겨찾기 테이블 관계
    routine = relationship('Routine', back_populates='fav_poses')
    user = relationship('User', back_populates='fav_poses')
    pose = relationship('Pose', back_populates='fav_poses')