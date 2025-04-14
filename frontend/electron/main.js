const path = require('path');
const { app, BrowserWindow } = require('electron');

function createWindow () {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'), // ✅ 노출 최소화용
      contextIsolation: true,                      // ✅ 보안: 렌더러 분리
      nodeIntegration: false,                      // ✅ 보안: Node 차단
      sandbox: true                                // ✅ 샌드박스 활성화
    }
  });

  // 개발 환경에서는 localhost:3000 (CRA dev server)
  win.loadURL("http://localhost:3000");

  // 프로덕션용 경로 (빌드 후 사용할 경우)
  // win.loadFile(path.join(__dirname, '../frontend/build/index.html'));
}

app.whenReady().then(() => {
  createWindow();

  // ✅ 보안 정책 설정: 팝업/외부 탐색 차단
  app.on('web-contents-created', (_, contents) => {
    contents.setWindowOpenHandler(() => ({ action: 'deny' }));
    contents.on('will-navigate', (e) => e.preventDefault());
  });
});