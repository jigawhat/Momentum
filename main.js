//handle setupevents as quickly as possible
 const setupEvents = require('./installers/setupEvents')
 if (setupEvents.handleSquirrelEvent()) {
    // squirrel event handled and app will exit in 1000ms, so don't do anything else
    return;
 }

const electron = require('electron');
const path = require('path');
const url = require('url');

// Autoupdate
require('update-electron-app')();

const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const Tray = electron.Tray;
const Menu = electron.Menu;
const Notification = electron.Notification;
const nativeImage = electron.nativeImage;

// Constants
const icopath = __dirname+'/img/8ball.ico';
const info_ico = __dirname+'/img/8ball_info.ico';

const gotTheLock = app.requestSingleInstanceLock();

let testVar = 0;
let win;
let tray;


// Function library (todo: make new file)
function sendNotif() {
  notif = new Notification({
    title: 'Looks like you\'re tilted...',
    body: 'Try taking a break. Play some TFT!',
    icon: nativeImage.createFromPath(info_ico)
  });

  notif.show();
}

function createWindow() {

  // Create system tray menu
  tray = new Tray(icopath);
  const contextMenu = Menu.buildFromTemplate([
    {label: 'Quiet mode', type: 'checkbox', checked: false},
    {label: 'sep1', type: 'separator'},
    {label: 'Quit', click: function (item, window, event) {app.exit();}}
  ]);
  tray.setToolTip('Momentum: +5%');
  tray.setContextMenu(contextMenu);

  tray.on('click', function (event) {
    win.show();
  });

  // Create browser window
  win = new BrowserWindow({
    width: 800,
    height: 600,
    icon: icopath,
    webPreferences: {
      nodeIntegration: true
    }
  });
  win.on('minimize', function(event) {
    event.preventDefault();
    win.hide();
  });
  win.on('close', function (event) {
    if(!app.isQuiting){
      event.preventDefault();
      win.hide();
    }
    return false;
  });
  win.removeMenu();

  win.loadURL(url.format({ // Load index.html
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }));

  // Open devtools
  win.webContents.openDevTools();

  // win.on('closed', () => {
  //   win = null;
  // })

  setTimeout(sendNotif, 3000);
}


// Check if Momentum is already running; if so, quit the second instance and focus the first
if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    // Someone tried to run a second instance, we should focus our window.
    if (win) {
      if (win.isMinimized()) win.restore()
      win.focus()
    }
  });

  // Create window, load the rest of the app, etc...
  // app.setAppUserModelId(process.execPath);

  app.on('ready', createWindow);  // Create window

  // app.on('window-all-closed', () => {
  //   if (process.platform !== 'darwin') { // If we're on windows, quit on all windows closed
  //     app.quit();
  //   }
  // });

  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
      createWindow();
    }
  })
}







