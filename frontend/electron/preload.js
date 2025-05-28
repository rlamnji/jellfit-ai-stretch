const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  startPostureMode: () => ipcRenderer.send('start-posture-mode'),

  notify: (title, body) => {
    ipcRenderer.send("show-notification", { title, body });
  },

  onNotificationAck: (callback) => {
    ipcRenderer.on("notification-ack", (_, ...args) => callback(...args));
  },

});
