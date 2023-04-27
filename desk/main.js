const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')

let i = 0;

function sendUser (event, user) {

  /*
  const webContents = event.sender
  const win = BrowserWindow.fromWebContents(webContents)
  win.setTitle(title)*/
  console.log('main sendUser', user)
  event.reply('reply', 'Usuario recebido' + i++);
}

function sendHTML (event, html) {

  /*
  const webContents = event.sender
  const win = BrowserWindow.fromWebContents(webContents)
  win.setTitle(title)*/
  console.log('main sendHTML', html)
}

function createWindow () {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true
    }
  })
  //win.loadFile('index.html');
  //win.loadURL('http://localhost:3000');
  if(app.isPackaged) {
    win.loadFile('index.html'); // prod
  }else{
    win.loadURL('http://localhost:3000'); // dev
  }

  win.webContents.openDevTools()
/*
  ipcMain.on('message', (event, arg) => {
    console.log(arg); // prints "Hello from App.js"
    event.reply('reply', 'received Hello from main.js');
  });*/

}

app.whenReady().then(() => {
  createWindow()

  ipcMain.on('send-user', sendUser)
  ipcMain.on('send-html', sendHTML)
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})