const path = require('path');
const { app, BrowserWindow } = require('electron');

function createWindow () {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
    }
  });

  // 개발 환경에서는 localhost:3000 (CRA dev server)
  win.loadURL("http://localhost:3000");

  // 프로덕션용 경로 (빌드 후 사용할 경우)
  // win.loadFile(path.join(__dirname, '../frontend/build/index.html'));
}

app.whenReady().then(createWindow);