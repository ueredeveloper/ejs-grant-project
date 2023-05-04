const { app, BrowserWindow, ipcMain, Menu } = require('electron')
const { MenuItem } = require('electron/main');
const { endianness } = require('os');
const path = require('path')

let parecer_html = `<p>editable area</p>`

/**
 * Esta função gera uma string de código JavaScript executável.
 * Ela recebe uma string HTML como parâmetro e a usa para modificar o corpo
 * do terceiro elemento iframe na página, caso haja pelo menos 5 elementos iframe o iframe é editável.
 *
 * @param {string} html - A string HTML para inserir no corpo do iframe.
 * @returns {string} O código JavaScript gerado como uma string.
 */
const excecutableJavascript = (html) => {
  return `
    if(typeof _frames === 'undefined') {
      let _frames = document.getElementsByTagName('iframe');
        if (_frames.length>=5) {
          _frames[2].contentDocument.body.innerHTML = '${html}'
        }
      } 
  `
};

/**
 * Esta função responde a um evento de usuário enviando uma mensagem de resposta
 * contendo a mensagem "Usuario recebido" e incrementando um contador interno.
 *
 * @param {object} event - O objeto que representa o evento do usuário.
 * @param {object} user - O objeto que representa o usuário que enviou o evento.
 */
function sendUser(event, user) {
  event.reply('reply', 'Usuario recebido');
}

function sendHTML(event, html) {
  parecer_html = html;
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
            //win.loadURL('https://sei.df.gov.br/sip/login.php?sigla_orgao_sistema=GDF&sigla_sistema=SEI')
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
        })

      if (isEditable) {

        try {
          await bw.
            webContents.
            executeJavaScript(excecutableJavascript(parecer_html))
        } catch (err) {
          console.log(err)
        }

      }

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