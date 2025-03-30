const { app, BrowserWindow } = require('electron');
const path = require('path');
const url = require('url')

require("electron-reload")(__dirname);

const createWindow = () => { // (1)
  const win = new BrowserWindow({
    width: 1024,
    height: 768,
  });
  
  const startUrl = process.env.ELECTRON_START_URL || url.format({  // (2)
    pathname: path.join(__dirname, '/../build/index.html'),
    protocol: 'file:',
    slashes: true
  });

  win.loadURL(startUrl);
};

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => { // (3)
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => { // (4)
  if (process.platform !== 'darwin') {
    app.quit();
  }
});