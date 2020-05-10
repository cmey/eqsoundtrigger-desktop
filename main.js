const electron = require('electron')
const url = require('url')
const path = require('path')

const { app, BrowserWindow, Menu, ipcMain } = electron

// Set environment
// process.env.NODE_ENV = 'production'

const isMac = process.platform === 'darwin'

let mainWindow
let addWindow

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(function () {
  // Create new window.
  mainWindow = new BrowserWindow({
    // Allow require() in html script block.
    webPreferences: {
      nodeIntegration: true
    }
  })

  // Load HTML into window.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'app/mainWindow.html'),
    protocol: 'file',
    slashes: true,
  }))

  // Quit app when main window closed.
  mainWindow.on('closed', function () {
    app.quit()
  })

  // Build from template
  const mainMenu = Menu.buildFromTemplate(mainWindowTemplate)
  // Insert menu
  Menu.setApplicationMenu(mainMenu)
})

// Handle create add window.
function createAddWindow() {
  // Create new window.
  addWindow = new BrowserWindow({
    width: 300,
    height: 200,
    title: 'Add trigger item',

    // Allow require() in html script block.
    webPreferences: {
      nodeIntegration: true
    }
  })

  // Garbage collection handle.
  addWindow.on('close', function () {
    addWindow = null
  })

  // Load HTML into window.
  addWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'app/addWindow.html'),
    protocol: 'file',
    slashes: true
  }))
}

// Catch character:add
ipcMain.on('character:add', function (event, character) {
  // From addWindow send to mainWindow.
  mainWindow.webContents.send('character:add', character)
  addWindow.close()
})

// Create menu template
// const mainWindowTemplate = [
//     {
//         label: 'File',
//         submenu: [
//             {
//                 label: 'Quit',
//                 accelerator: process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
//                 click(){
//                     app.quit()
//                 }
//             }
//         ]
//     }
// ]

const mainWindowTemplate = [
  // { role: 'appMenu' }
  ...(isMac ? [{
    label: app.name,
    submenu: [
      { role: 'about' },
      { type: 'separator' },
      { role: 'services' },
      { type: 'separator' },
      { role: 'hide' },
      { role: 'hideothers' },
      { role: 'unhide' },
      { type: 'separator' },
      { role: 'quit' }
    ]
  }] : []),
  // { role: 'fileMenu' }
  {
    label: 'File',
    submenu: [
      {
        label: 'Create Trigger',
        accelerator: process.platform == 'darwin' ? 'Command+C' : 'Ctrl+C',
        click() {
          createAddWindow()
        }
      },
      {
        label: 'Clear Triggers',
        click() {
          mainWindow.webContents.send('triggers:clear')
        }
      },
      isMac ? { role: 'close' } : { role: 'quit' }
    ]
  },
  // { role: 'editMenu' }
  {
    label: 'Edit',
    submenu: [
      { role: 'undo' },
      { role: 'redo' },
      { type: 'separator' },
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' },
      ...(isMac ? [
        { role: 'pasteAndMatchStyle' },
        { role: 'delete' },
        { role: 'selectAll' },
        { type: 'separator' },
        {
          label: 'Speech',
          submenu: [
            { role: 'startspeaking' },
            { role: 'stopspeaking' }
          ]
        }
      ] : [
          { role: 'delete' },
          { type: 'separator' },
          { role: 'selectAll' }
        ])
    ]
  },
  // { role: 'viewMenu' }
  {
    label: 'View',
    submenu: [
      { role: 'reload' },
      { role: 'forcereload' },
      { role: 'toggledevtools' },
      { type: 'separator' },
      { role: 'resetzoom' },
      { role: 'zoomin' },
      { role: 'zoomout' },
      { type: 'separator' },
      { role: 'togglefullscreen' }
    ]
  },
  // { role: 'windowMenu' }
  {
    label: 'Window',
    submenu: [
      { role: 'minimize' },
      { role: 'zoom' },
      ...(isMac ? [
        { type: 'separator' },
        { role: 'front' },
        { type: 'separator' },
        { role: 'window' }
      ] : [
          { role: 'close' }
        ])
    ]
  },
  {
    role: 'help',
    submenu: [
      {
        label: 'Learn More',
        click: async () => {
          const { shell } = require('electron')
          await shell.openExternal('https://electronjs.org')
        }
      }
    ]
  }
]

// Developer tools
if (process.env.NODE_ENV !== 'production') {
  mainWindowTemplate.push({
    label: 'Developer Tools',
    submenu: [
      {
        label: 'Toggle Dev Tools',
        accelerator: 'CmdOrCtrl+I',
        click(item, focusedWindow) {
          focusedWindow.toggleDevTools()
        }
      },
      {
        role: 'reload'
      }
    ]
  })
}
