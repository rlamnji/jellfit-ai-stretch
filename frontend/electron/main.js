const { app, BrowserWindow, session, ipcMain, Notification } = require('electron');
const path = require('path');

function createWindow () {

  const mainWindow = new BrowserWindow({
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
  mainWindow.loadURL("http://localhost:3000");
  
  // 프로덕션용 경로 (빌드 후 사용할 경우)
  // mainWindow.loadFile(path.join(__dirname, '../frontend/build/index.html'));

  //자세교정모드 켜면 뜨는 창
  ipcMain.on('start-posture-mode', () => {
    mainWindow.webContents.loadURL("http://localhost:3000/posture/state");
    mainWindow.minimize();

    const postureCameraWindow = new BrowserWindow({
      // width: 320,
      // height: 240,
      width: 800,
      height: 1000,
      // frame: false,
      // alwaysOnTop: true,
      // resizable: false,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'), 
        nodeIntegration: false,
        contextIsolation: true,
      },
    });

    postureCameraWindow.loadURL("http://localhost:3000/camera/posture");

    // 전체 화면 아이콘 만들면 이거 수정해야 됨.
    postureCameraWindow.on('closed', () => {
      mainWindow.show(); // 카메라 창 닫히면 메인창 다시 보여주기
    });
  });

  ipcMain.on("show-notification", (event, { title, body }) => {
    console.log("📥 알림 요청 수신됨:", title, body);
    
    const notification = new Notification({
      title,
      body,
      actions: [{ text: "확인", type: "button" }],
      closeButtonText: "닫기",
    });
  
    notification.on("action", () => {
      event.sender.send("notification-ack");
    });
  
    notification.show();
  });
  
  

  ipcMain.on("navigate-main", (event) => {
    const windows = BrowserWindow.getAllWindows();
    const postureCameraWindow = windows.find(w => w.getBounds().width === 320); // 조건은 자유롭게
    const mainWindow = windows.find(w => w !== postureCameraWindow);
  
    if (postureCameraWindow) postureCameraWindow.close(); // 현재 창 닫기
    if (mainWindow) mainWindow.show(); // 메인창 다시 표시
  });
}




app.whenReady().then(() => {
  createWindow();

  // 팝업/외부 탐색 차단
  app.on('web-contents-created', (_, contents) => {
    contents.setWindowOpenHandler(() => ({ action: 'deny' }));
    contents.on('will-navigate', (e) => e.preventDefault());
  });
});