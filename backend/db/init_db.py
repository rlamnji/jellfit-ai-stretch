import sys, os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from db.models import Base, User, Category, Pose, Routine, RoutinePose, Character
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

db.add(User(user_id=1, username="테스터1", id="temp001", password=pwd_context.hash("1234"), introduction="Hello!"))
db.add(User(user_id=2, username="테스터2", id="temp002", password=pwd_context.hash("5678")))
db.add(User(user_id=3, username="테스터3", id="temp003", password=pwd_context.hash("9101112")))


db.add(Category(category_id=1, name="목"))
db.add(Category(category_id=2, name="어깨"))
db.add(Category(category_id=3, name="팔/손목"))
db.add(Category(category_id=4, name="등/허리"))
db.add(Category(category_id=5, name="가슴"))

db.add(Pose(pose_id=6, name="손목돌리기", duration=None, count=5,
            video_url="https://www.youtube.com/shorts/-0nB9SlxzO4",
            thumbnail_url="/images/stretching/smdrg",
            category_id=3))  # 팔/손목

db.add(Pose(pose_id=7, name="팔꿈치굽혀서옆구리늘리기", duration=10, count=1,
            video_url="https://www.youtube.com/watch?v=RobdPJZAXdM",
            thumbnail_url="/images/stretching/pkcghsygnrrg",
            category_id=4))  # 등/허리

db.add(Pose(pose_id=8, name="T자가슴열기", duration=10, count=None,
            video_url="https://www.youtube.com/shorts/G-1VPhV0Yhl",
            thumbnail_url=None,
            category_id=5))  # 가슴

db.add(Pose(pose_id=9, name="Y자가슴열기", duration=10, count=None,
            video_url="https://www.youtube.com/shorts/G-1VPhV0Yhl",
            thumbnail_url=None,
            category_id=5))  # 가슴

db.add(Pose(pose_id=10, name="손걸고잡아당기기", duration=5, count=None,
            video_url="https://www.youtube.com/shorts/8q3lHCP3E7g",
            thumbnail_url=None,
            category_id=2))  # 어깨

db.add(Pose(pose_id=11, name="팔앞으로쭉뻗기", duration=5, count=3,
            video_url="https://www.youtube.com/shorts/ye8pe1j5OeQ",
            thumbnail_url="/images/stretching/paprjpg",
            category_id=4))  # 등/허리

db.add(Pose(pose_id=12, name="팔뻗고옆구리늘리기", duration=10, count=None,
            video_url=None,
            thumbnail_url=None,
            category_id=4))  # 등/허리


db.add(Routine(routine_id=1, user_id=1, image_url="https://example.com/routine1.jpg"))
db.add(Routine(routine_id=2, user_id=2))

db.add(RoutinePose(routine_id=1, pose_id=1, order=1))
db.add(RoutinePose(routine_id=1, pose_id=2, order=2))
db.add(RoutinePose(routine_id=2, pose_id=3, order=1))
db.add(RoutinePose(routine_id=2, pose_id=5, order=2))
db.add(RoutinePose(routine_id=2, pose_id=4, order=3))

db.add(Character(character_id=1, name="기본 해파리", description="기본 해파리.", acquisition_num=2, image_url="https://example.com/default.jpg", pose_id=1))
db.add(Character(character_id=2, name="한입 먹힌 해파리", description="2◎421년 제 32회 해파리 스트레칭난에서 부상투혼을 해버린 해파리. 어딘지 모를 [ 비장함 ]이 느껴진다.."))
db.add(Character(character_id=3, name="새끼 해파리", description="응애."))
db.add(Character(character_id=4, name="거꾸로 해파리", description="리파해 로꾸거 는저 요세하녕안"))
db.add(Character(character_id=5, name="무서운 해파리", description="우주의 츤데레"))
db.add(Character(character_id=6, name="다이어트 해파리", description="젤리 질량을 0.1g까지 줄이기 위해 최근 심해 필라테스를 시작했다."))
db.add(Character(character_id=7, name="뚱파리", description="해파리계의 푸근한 형. 다들 기대서 눕는다."))
db.add(Character(character_id=8, name="똥파리", description="이름이 불명예스럽지만 사실은 깊은 해저 정화 활동을 담당한다. 자칭 “물의 배설 시스템”."))
db.add(Character(character_id=9, name="유령 해파리", description="존재하되 존재하지 않는 해파리. 투명도 99.9%."))
db.add(Character(character_id=10, name="화난 해파리", description="뿔났다. 이유는 없다."))
db.add(Character(character_id=11, name="단발머리그소녀파리", description="찰랑이는 단발머리. 아무 말 없이 고개를 돌릴 때마다 수면 위가 출렁."))
db.add(Character(character_id=12, name="매먀리", description="고먐미처럼 네모가 된 해파리."))
db.add(Character(character_id=13, name="아보카도 해파리", description="몸이 아보카도가 되어버린 해파리."))
db.add(Character(character_id=14, name="애플파리", description="“사과할게… 너무 귀여워서.”"))
db.add(Character(character_id=15, name="해파리지앵", description="화가임. 베레모를 쓰고 트렌치코트입음."))
db.add(Character(character_id=16, name="머리에 셔틀콕을 얹은 해파리", description="아무도 그 셔틀콕을 뺏을 수 없다."))
db.add(Character(character_id=17, name="짱구파리", description="짱구 얼굴을 함. 저작권 문제가 있진 않을까?"))
db.add(Character(character_id=18, name="쥐파리", description="쥐의 이빨과 꼬리랑 귀모양의 해파리"))
db.add(Character(character_id=19, name="아이스크림해파리", description="너무 가까이 가면 녹아내린 감정에 젖는다."))
db.add(Character(character_id=20, name="한문선생님 해파리", description="“子曰…”"))
db.add(Character(character_id=21, name="도넛 해파리", description="초코, 딸기, 글레이즈. 해파리계의 디저트 셀럽."))
db.add(Character(character_id=22, name="가나디 해파리", description="강아지인지 해파리인지? 주인만 보면 촉수를 흔든다."))
db.add(Character(character_id=23, name="종이 해파리", description="물에 있으면 녹는다….."))
db.add(Character(character_id=24, name="프릴 해파리", description="레이스 장식으로 몸체 표현한다. 움직임이 우아하다."))
db.add(Character(character_id=25, name="수염난 해파리", description="“나 때는 말이야…”"))
db.add(Character(character_id=26, name="젤리빈 해파리", description="알록달록 작고 통통 튀는 질감. 젤리맛일까?"))
db.add(Character(character_id=27, name="모자를눌러쓴 해파리", description="캡모자를 푹 눌러쓰고 말이 없다. 정체는 불명."))
db.add(Character(character_id=28, name="파워E파리", description="파워 ENFP 해파리. 아마 제일 시끄러울 것이다."))
db.add(Character(character_id=29, name="픽셀 해파리", description="해상도가 낮아 가까이 가야 겨우 보인다. 가끔 렉 걸림."))
db.add(Character(character_id=30, name="‘이건 해파리가 아니다’ 해파리", description="분명히 해파리다. 존재 자체가 질문이다."))
db.add(Character(character_id=31, name="줄무늬 해파리", description="몸에 선명한 줄무늬가 나 있다. 해수욕장에서 자주 발견!"))
db.add(Character(character_id=32, name="지각 해파리", description="“방금 일어났어…”"))
db.add(Character(character_id=33, name="아무말 해파리", description="“해무리물꽃심해자장면!”"))
db.add(Character(character_id=34, name="이름이 없는 해파리", description="모든 해파리에 이름이 생겼을 때, 이 해파리는 조용히 밖에 있었다."))
db.add(Character(character_id=35, name="펑크 해파리", description="바다의 반항아. 체인과 피어싱이 촉수에 달려 있다."))
db.add(Character(character_id=36, name="투명 해파리", description="안 보인다. 진짜로. 실루엣만 아련히 보일 뿐."))
db.add(Character(character_id=37, name="할머니 해파리", description="아주 오래된 우주 해파리 이야기를 반복한다."))
db.add(Character(character_id=38, name="책 먹는 해파리", description="어디까지 읽었더라.."))
db.add(Character(character_id=39, name="마법 해파리", description="해수 위를 둥둥 떠다니며 마법진을 남긴다."))
db.add(Character(character_id=40, name="거짓말 해파리", description="“ 나 사실 사람이야. “"))
db.add(Character(character_id=41, name="메이드 해파리", description="주인님, 해저청소는 완료되었습니다."))
db.add(Character(character_id=42, name="롱다리 해파리", description="촉수가 너무 길다. 수심 300m까지 도달 가능."))
db.add(Character(character_id=43, name="공주 해파리", description="“이건 내 바다야, 알지?”"))
db.add(Character(character_id=44, name="왕 해파리", description="금빛 왕관을 쓰고 늘 위엄 있게 둥둥 떠다닌다."))
db.add(Character(character_id=45, name="물방울에 갇힌 해파리", description="투명한 물방울 안에 고요히 갇혀 있다. 갇혀 있는 건지 스스로 들어간 건지 아무도 모른다."))
db.add(Character(character_id=46, name="비눗방울 해파리", description="비눗방울을 불며 놀다가 스스로 거품이 됐다"))
db.add(Character(character_id=47, name="초콜릿 해파리", description="이 세계 음식을 좋아하더니 아예 초콜릿으로 변해버렸다."))
db.add(Character(character_id=48, name="당근 흔드는 해파리", description="말 못할 비밀이 있나보다."))
db.add(Character(character_id=49, name="단세포 해파리", description="유독 단순하다. 말이 통하지 않는다."))
db.add(Character(character_id=50, name="코딩 해파리", description="\"fix: unknown space error\"."))

db.commit()
db.close()
