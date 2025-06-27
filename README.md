# JellFit

JellFit는 피트니스 트래킹 애플리케이션입니다.

## 프로젝트 구조

```
jellfit/
├── frontend/          # 프론트엔드 코드
└── backend/           # 백엔드 코드
    ├── main.py        # FastAPI 애플리케이션 진입점
    ├── database.py    # 데이터베이스 설정
    ├── .env          # 환경 변수
    └── requirements.txt # Python 의존성
```

## 백엔드 설정

1. 가상환경 생성 및 활성화:
```bash
python -m venv venv
source venv/bin/activate  # Linux/Mac
.\venv\Scripts\activate   # Windows
```

2. 의존성 설치: 프로젝트 루트에서
```bash
pip install -r requirements.txt
```

3. 환경 변수 설정:
- `.env` 파일을 생성하고 필요한 환경 변수를 설정합니다.

4. 서버 실행:
```bash
uvicorn main:app --reload
```

## 서버 실행
cd backend -> uvicorn app.main:app --reload
cd frontend -> yarn start 
cd frontend -> yarn electron start

API 문서는 http://localhost:8000/docs 에서 확인할 수 있습니다.
