import sys, os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from db.models import Base, User, Category, Pose, Routine, RoutinePose, Character, UserCharacter, UsageRecord, Calibration, UserCalibration, UserCalibrationLandmark, DailyUsageLog
from passlib.context import CryptContext

# 비밀번호 해싱을 위한 패스리브 컨텍스트
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# SQLite 기준
engine = create_engine("sqlite:///./db/db.sqlite3", echo=True)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 테이블 생성
Base.metadata.create_all(bind=engine)

# 더미 데이터 삽입
db = SessionLocal()

db.add(User(username="테스터1", id="temp001", password=pwd_context.hash("1234"), introduction="Hello!"))
db.add(User(username="테스터2", id="temp002", password=pwd_context.hash("5678") , introduction="한줄소개입니다!"))
db.add(User(username="테스터3", id="temp003", password=pwd_context.hash("9101112"), introduction="테스트한줄소개개"))


# 사용자 캐릭터 테이블 (더미데이터)
# user_id 1번 사용자가 character_id 1~4 보유
db.add(UserCharacter(user_id=1, character_id=1))
db.add(UserCharacter(user_id=1, character_id=2))
db.add(UserCharacter(user_id=1, character_id=3))
db.add(UserCharacter(user_id=1, character_id=4))

# user_id 2번 사용자가 character_id 5, 6 보유
db.add(UserCharacter(user_id=2, character_id=5))
db.add(UserCharacter(user_id=2, character_id=6))


db.add(Category(name="목"))
db.add(Category(name="어깨"))
db.add(Category(name="팔/손목"))
db.add(Category(name="등/허리"))
db.add(Category(name="가슴"))

# 캘리브레이션 정보
calibration_names = [
    "shoulder_width",
    "left_arm_length",
    "right_arm_length",
    "tpose_wrist_distance",
    "neutral_left_eye_ear_y_diff",
    "neutral_right_eye_ear_y_diff",
    "avg_arm_length",
    "wrist_expansion_ratio",
    "arm_shoulder_ratio",
]

for name in calibration_names:
    db.add(Calibration(name=name))


# 사용자 스트레칭 기록(횟수 + 시간) (더미데이터)
db.add(UsageRecord(record_id=1, user_id=1, pose_id=1, repeat_cnt=5))
db.add(UsageRecord(record_id=2, user_id=1, pose_id=2, repeat_cnt=1))

# 스트레칭(자세) 정보 
db.add(Pose(name="손목돌리기", duration=None, count=5,
            video_url="https://www.youtube.com/embed/-0nB9SlxzO4",
            thumbnail_url="/images/stretching/smdrg",
            category_id=3))  # 팔/손목

db.add(Pose(name="팔꿈치굽혀서옆구리늘리기", duration=10, count=1,
            video_url="https://www.youtube.com/embed/RobdPJZAXdM",
            thumbnail_url="/images/stretching/pkcghsygnrrg",
            category_id=4))  # 등/허리

db.add(Pose(name="T자가슴열기", duration=10, count=None,
            video_url="https://www.youtube.com/embed/G-1VPhV0Yhl",
            thumbnail_url="/images/stretching/tjgsyg",
            category_id=5))  # 가슴

db.add(Pose(name="Y자가슴열기", duration=10, count=3,
            video_url="https://www.youtube.com/embed/G-1VPhV0Yhl",
            thumbnail_url="/images/stretching/yjgsyg",
            category_id=5))  # 가슴

db.add(Pose(name="손걸고잡아당기기", duration=5, count=3,
            video_url="https://www.youtube.com/embed/8q3lHCP3E7g",
            thumbnail_url="/images/stretching/sggjadgg",
            category_id=2))  # 어깨

db.add(Pose(name="팔앞으로쭉뻗기", duration=5, count=3,
            video_url="https://www.youtube.com/embed/ye8pe1j5OeQ",
            thumbnail_url="/images/stretching/paprjpg",
            category_id=4))  # 등/허리

db.add(Pose(name="팔뻗고옆구리늘리기", duration=10, count=None,
            video_url="https://www.youtube.com/embed/RobdPJZAxdM",
            thumbnail_url="/images/stretching/pfgygrnrg",
            category_id=4))  # 등/허리

db.add(Pose(name="목뒤로젖히기", duration=10, count=None,
            video_url="https://www.youtube.com/embed/UfvkTe8cP5c",
            thumbnail_url="/images/stretching/mdrjhg",
            category_id=1))  # 목
db.add(Pose(name="겨드랑이향하여목당기기", duration=10, count=None,
            video_url="https://www.youtube.com/embed/LNwfbj_Sy7M",
            thumbnail_url=None,
            category_id=1))  # 목
db.add(Pose(name="팔꿈치바깥으로회전하기", duration=10, count=None,
            video_url="https://www.youtube.com/embed/dtOS8lVzQIQ",
            thumbnail_url=None,
            category_id=2))  # 어깨


db.add(Routine(user_id=1, image_url="https://example.com/routine1.jpg"))
db.add(Routine(user_id=2))

db.add(RoutinePose(routine_id=1, pose_id=1, order=1))
db.add(RoutinePose(routine_id=1, pose_id=2, order=2))
db.add(RoutinePose(routine_id=2, pose_id=3, order=1))
db.add(RoutinePose(routine_id=2, pose_id=5, order=2))
db.add(RoutinePose(routine_id=2, pose_id=4, order=3))

# 해파리 정보 등록
db.add(Character(name="기본 해파리", description="기본 해파리.", acquisition_num=3, image_url="/images/models/jelly1.png", pose_id=1))
db.add(Character(name="한입 먹힌 해파리", description="2◎421년 제 32회 해파리 스트레칭난에서 부상투혼을 해버린 해파리. 어딘지 모를 [ 비장함 ]이 느껴진다..", acquisition_num=3, image_url="/images/models/jelly2.png", pose_id=2))
db.add(Character(name="새끼 해파리", description="응애.", acquisition_num=3, image_url="/images/models/jelly3.png", pose_id=3))
db.add(Character(name="거꾸로 해파리", description="리파해 로꾸거 는저 요세하녕안", acquisition_num=3, image_url="/images/models/jelly4.png", pose_id=4))
db.add(Character(name="무서운 해파리", description="우주의 츤데레", acquisition_num=3, image_url="/images/models/jelly5.png", pose_id=5))
db.add(Character(name="다이어트 해파리", description="젤리 질량을 0.1g까지 줄이기 위해 최근 심해 필라테스를 시작했다.", acquisition_num=3, image_url="/images/models/jelly6.png", pose_id=6))
db.add(Character(name="뚱파리", description="해파리계의 푸근한 형. 다들 기대서 눕는다.", acquisition_num=3, image_url="/images/models/jelly7.png", pose_id=7))
db.add(Character(name="똥파리", description="이름이 불명예스럽지만 사실은 깊은 해저 정화 활동을 담당한다. 자칭 “물의 배설 시스템”.", acquisition_num=5, image_url="/images/models/jelly8.png", pose_id=8))
db.add(Character(name="유령 해파리", description="존재하되 존재하지 않는 해파리. 투명도 99.9%.", acquisition_num=3, image_url="/images/models/jelly9.png", pose_id=9))
db.add(Character(name="화난 해파리", description="뿔났다. 이유는 없다.", acquisition_num=3, image_url="/images/models/jelly10.png", pose_id=10))

# 앞으로 스트레칭 추가될 때마다 여기부터 해파리 매칭하면 됨.
db.add(Character(name="단발머리그소녀파리", description="찰랑이는 단발머리. 아무 말 없이 고개를 돌릴 때마다 수면 위가 출렁.", acquisition_num=2, image_url="/images/models/jelly11.png"))
db.add(Character(name="매먀리", description="고먐미처럼 네모가 된 해파리.", acquisition_num=2, image_url="/images/models/jelly12.png"))
db.add(Character(name="아보카도 해파리", description="몸이 아보카도가 되어버린 해파리.", acquisition_num=2, image_url="/images/models/jelly13.png"))
db.add(Character(name="애플파리", description="“사과할게… 너무 귀여워서.”", acquisition_num=2, image_url="/images/models/jelly14.png"))
db.add(Character(name="해파리지앵", description="화가임. 베레모를 쓰고 트렌치코트입음.", acquisition_num=2, image_url="/images/models/jelly15.png"))
db.add(Character(name="머리에 셔틀콕을 얹은 해파리", description="아무도 그 셔틀콕을 뺏을 수 없다.", acquisition_num=2, image_url="/images/models/jelly16.png"))
db.add(Character(name="짱구파리", description="짱구 얼굴을 함. 저작권 문제가 있진 않을까?", acquisition_num=2, image_url="/images/models/jelly17.png"))
db.add(Character(name="쥐파리", description="쥐의 이빨과 꼬리랑 귀모양의 해파리", acquisition_num=2, image_url="/images/models/jelly18.png"))
db.add(Character(name="아이스크림해파리", description="너무 가까이 가면 녹아내린 감정에 젖는다.", acquisition_num=2, image_url="/images/models/jelly19.png"))
db.add(Character(name="한문선생님 해파리", description="“子曰…”", acquisition_num=2, image_url="/images/models/jelly20.png"))
db.add(Character(name="도넛 해파리", description="초코, 딸기, 글레이즈. 해파리계의 디저트 셀럽.", acquisition_num=2, image_url="/images/models/jelly21.png"))
db.add(Character(name="가나디 해파리", description="강아지인지 해파리인지? 주인만 보면 촉수를 흔든다.", acquisition_num=2, image_url="/images/models/jelly22.png"))
db.add(Character(name="종이 해파리", description="물에 있으면 녹는다…..", acquisition_num=2, image_url="/images/models/jelly23.png"))
db.add(Character(name="프릴 해파리", description="레이스 장식으로 몸체 표현한다. 움직임이 우아하다.", acquisition_num=2, image_url="/images/models/jelly24.png"))
db.add(Character(name="수염난 해파리", description="“나 때는 말이야…”", acquisition_num=2, image_url="/images/models/jelly25.png"))
db.add(Character(name="젤리빈 해파리", description="알록달록 작고 통통 튀는 질감. 젤리맛일까?", acquisition_num=2, image_url="/images/models/jelly26.png"))
db.add(Character(name="모자를눌러쓴 해파리", description="캡모자를 푹 눌러쓰고 말이 없다. 정체는 불명.", acquisition_num=2, image_url="/images/models/jelly27.png"))
db.add(Character(name="파워E파리", description="파워 ENFP 해파리. 아마 제일 시끄러울 것이다.", acquisition_num=2, image_url="/images/models/jelly28.png"))
db.add(Character(name="픽셀 해파리", description="해상도가 낮아 가까이 가야 겨우 보인다. 가끔 렉 걸림.", acquisition_num=2, image_url="/images/models/jelly29.png"))
db.add(Character(name="‘이건 해파리가 아니다’ 해파리", description="분명히 해파리다. 존재 자체가 질문이다.", acquisition_num=2, image_url="/images/models/jelly30.png"))
db.add(Character(name="줄무늬 해파리", description="몸에 선명한 줄무늬가 나 있다. 해수욕장에서 자주 발견!", acquisition_num=2, image_url="/images/models/jelly31.png"))
db.add(Character(name="지각 해파리", description="“방금 일어났어…”", acquisition_num=2, image_url="/images/models/jelly32.png"))
db.add(Character(name="아무말 해파리", description="“해무리물꽃심해자장면!”", acquisition_num=2, image_url="/images/models/jelly33.png"))
db.add(Character(name="이름이 없는 해파리", description="모든 해파리에 이름이 생겼을 때, 이 해파리는 조용히 밖에 있었다.", acquisition_num=2, image_url="/images/models/jelly34.png"))
db.add(Character(name="펑크 해파리", description="바다의 반항아. 체인과 피어싱이 촉수에 달려 있다.", acquisition_num=2, image_url="/images/models/jelly35.png"))
db.add(Character(name="투명 해파리", description="안 보인다. 진짜로. 실루엣만 아련히 보일 뿐.", acquisition_num=2, image_url="/images/models/jelly36.png"))
db.add(Character(name="할머니 해파리", description="아주 오래된 우주 해파리 이야기를 반복한다.", acquisition_num=2, image_url="/images/models/jelly37.png"))
db.add(Character(name="책 먹는 해파리", description="어디까지 읽었더라..", acquisition_num=2, image_url="/images/models/jelly38.png"))
db.add(Character(name="마법 해파리", description="해수 위를 둥둥 떠다니며 마법진을 남긴다.", acquisition_num=2, image_url="/images/models/jelly39.png"))
db.add(Character(name="거짓말 해파리", description="“ 나 사실 사람이야. “", acquisition_num=2, image_url="/images/models/jelly40.png"))
db.add(Character(name="메이드 해파리", description="주인님, 해저청소는 완료되었습니다.", acquisition_num=2, image_url="/images/models/jelly41.png"))
db.add(Character(name="롱다리 해파리", description="촉수가 너무 길다. 수심 300m까지 도달 가능.", acquisition_num=2, image_url="/images/models/jelly42.png"))
db.add(Character(name="공주 해파리", description="“이건 내 바다야, 알지?”", acquisition_num=2, image_url="/images/models/jelly43.png"))
db.add(Character(name="왕 해파리", description="금빛 왕관을 쓰고 늘 위엄 있게 둥둥 떠다닌다.", acquisition_num=2, image_url="/images/models/jelly44.png"))
db.add(Character(name="물방울에 갇힌 해파리", description="투명한 물방울 안에 고요히 갇혀 있다. 갇혀 있는 건지 스스로 들어간 건지 아무도 모른다.", acquisition_num=2, image_url="/images/models/jelly45.png"))
db.add(Character(name="비눗방울 해파리", description="비눗방울을 불며 놀다가 스스로 거품이 됐다", acquisition_num=2, image_url="/images/models/jelly46.png"))
db.add(Character(name="초콜릿 해파리", description="이 세계 음식을 좋아하더니 아예 초콜릿으로 변해버렸다.", acquisition_num=2, image_url="/images/models/jelly47.png"))
db.add(Character(name="당근 흔드는 해파리", description="말 못할 비밀이 있나보다.", acquisition_num=2, image_url="/images/models/jelly48.png"))
db.add(Character(name="단세포 해파리", description="유독 단순하다. 말이 통하지 않는다.", acquisition_num=2, image_url="/images/models/jelly49.png"))
db.add(Character(name="코딩 해파리", description="\"fix: unknown space error\".", acquisition_num=2, image_url="/images/models/jelly50.png"))

db.commit()
db.close()
