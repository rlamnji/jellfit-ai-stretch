# 젤핏(JellFit) Backend README
## Backend 실행 가이드

### 1. 가상환경 설정 (Windows 기준, vscode에서 실행)
```bash
python -m venv venv 
venv\Scripts\activate.bat
```
```bash
cd backend  # requirements.txt 설치 
pip install -r requirements.txt
```  

### 2. FastAPI 서버 실행
```bash
uvicorn app.main:app --reload
```

### ** 데이터베이스 생성(/backend 폴더에서 실행)
```bash
python -m db.init_db # -> db.sqlite3 파일 생성됨
```

### ** 데이터베이스 더미 데이터 넣기
init_db.py 파일을 수정해서 원하는 더미 데이터를 넣울 수 있음  
<b> ! 더미 데이터 수정할 때는 db 간의 관계와 데이터 생성 순서를 고려해야 함 ! </b> 
데이터 넣고서는 생성된 db.sqlite3 파일을 삭제하고 다시 데이터베이스 생성해야 함

### ** 데이터베이스 사용
example.py 의 내용을 참고하여 db.sqlite3 파일 사용법을 확인할 수 있음