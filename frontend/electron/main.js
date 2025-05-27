const { app, BrowserWindow, session, ipcMain, Notification, screen } = require('electron');
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

    const MARGIN = 10;
    const { width: screenWidth } = screen.getPrimaryDisplay().workAreaSize;

    const popupWidth = 320;
    const popupHeight = 240;

    const postureCameraWindow = new BrowserWindow({
      width: popupWidth,
      height: popupHeight,
      x: screenWidth - popupWidth - MARGIN,
      y: MARGIN,   
      frame: true,
      autoHideMenuBar: true,
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
      mainWindow.webContents.loadURL("http://localhost:3000/home");
      mainWindow.show(); // 카메라 창 닫히면 메인창 다시 보여주기
      //프레임전송꺼야함.ON!
    });
  });

  ipcMain.on("show-notification", (event, { title, body }) => {
    console.log("📥 알림 요청 수신됨:", title, body);
    
    const notification = new Notification({
      title,
      body
    });

  
    notification.show();
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