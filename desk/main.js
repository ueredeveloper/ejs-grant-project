const { app, BrowserWindow, ipcMain, Menu } = require('electron')
const { MenuItem } = require('electron/main');
const { endianness } = require('os');
const path = require('path')

let i = 0;
let parecer_html = `<p>editable area</p>`
let html_script = `
if(typeof _frames === 'undefined') {
  let _frames = document.getElementsByTagName('iframe');
    if (_frames.length===5) {
      _frames[2].contentDocument.body.innerHTML = ${parecer_html}
    }
  } 
`;

function sendUser(event, user) {

  /*
  const webContents = event.sender
  const win = BrowserWindow.fromWebContents(webContents)
  win.setTitle(title)*/
  console.log('main sendUser', user)
  event.reply('reply', 'Usuario recebido' + i++);
}

function sendHTML(event, html) {


  parecer_html = html;
  html_script = `
if(typeof _frames === 'undefined') {
  let _frames = document.getElementsByTagName('iframe');
    if (_frames.length===5) {
      _frames[2].contentDocument.body.innerHTML = ${parecer_html}
    }
  } 
`
  console.log('main sendHTML', html)
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true
    }

  })
  //win.loadFile('index.html');
  //win.loadURL('http://localhost:3000');
  if (app.isPackaged) {
    win.loadFile('index.html'); // prod
  } else {
    win.loadURL('http://localhost:3000'); // dev
  }

  const menu = Menu.getApplicationMenu();

  const template = {
    label: 'Navegação',
    submenu: [
      {
        label: "Sei", click: () => {
          try {
            win.loadURL('https://treinamento3.sei.df.gov.br/sip/login.php?sigla_orgao_sistema=GDF&sigla_sistema=SEI')
          } catch (err) {
            console.log(err)
          }
          let login = `
            document.getElementById('txtUsuario').value = "adasa1";
            document.getElementById('pwdSenha').value = "adasa1";
            document.getElementById('selOrgao').value = 41
        `
          win.webContents.executeJavaScript(login)
          console.log('login')

        }
      },
      {
        label: "Outorga", click: () => {
          if (app.isPackaged) {
            win.loadFile('index.html'); // prod
          } else {
            win.loadURL('http://localhost:3000'); // dev
          }

        }
      }
    ]
  }



  let item = new MenuItem(template)
  menu.append(item)
  Menu.setApplicationMenu(menu);

  win.webContents.on('did-frame-finish-load', async (event, url, frameId) => {
    // captura as janelas abertas
    const allWindows = BrowserWindow.getAllWindows();

    for (const [i, bw] of allWindows.entries()) {

      /**
       * Verifica se o iframe é editável, neste tipo há um id com o valor (#ifrEditorSalvar).
       */
      let isEditable = await bw.webContents.executeJavaScript(`document.querySelector('#ifrEditorSalvar') !== null`)
        .then((result) => {
          return result
        }).then(result => {
          // verifica se a tela tem o id ifrEditorSalvar
          if (result) {

            try {
              bw.
                webContents.
                executeJavaScript(html_script)
            } catch (err) {
              console.log(err)
            }

          }
        })
    }

  })

  win.webContents.openDevTools()

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