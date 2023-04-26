const { contextBridge, ipcRenderer } = require('electron');

window.addEventListener('DOMContentLoaded', () => {
    const replaceText = (selector, text) => {
      const element = document.getElementById(selector)
      if (element) element.innerText = text
    }
  
    for (const dependency of ['chrome', 'node', 'electron']) {
      replaceText(`${dependency}-version`, process.versions[dependency])
    }
  });

  contextBridge.exposeInMainWorld('myAPI', {
    sendMessage: (message) => {
      ipcRenderer.send('message', message);
    },
    receiveMessage: (callback) => {
      ipcRenderer.on('reply', (event, arg) => {
        callback(arg);
      });
    }
  });