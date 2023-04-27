const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {

  sendUser: (user) => ipcRenderer.send('send-user', user),
  sendHTML: (html) => ipcRenderer.send('send-html', html),
  receiveMessage: (callback) => {
    ipcRenderer.on('reply', (event, arg) => {
      callback(arg);
    });
  }

})