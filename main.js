// //handle setupevents as quickly as possible
//  const setupEvents = require('./installers/setupEvents')
//  if (setupEvents.handleSquirrelEvent()) {
//     // squirrel event handled and app will exit in 1000ms, so don't do anything else
//     return;
//  }

const electron = require('electron');
const { autoUpdater } = require("electron-updater");
const path = require('path');
const url = require('url');

// log = require('electron-log');
// log.transports.file.level = 'silly';
// log.transports.console.level = 'silly';

const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const Tray = electron.Tray;
const Menu = electron.Menu;
const Notification = electron.Notification;
const nativeImage = electron.nativeImage;

// Constants
const icon_ext = process.platform !== 'darwin' ? '.ico' : '.icns';
const icopath = __dirname + '/img/8ball' + icon_ext;
const icopath_png16 = __dirname + '/img/uncompressed/8ball_16.png';
const info_ico = __dirname + '/img/8ball_info' + icon_ext;
const ico_img = nativeImage.createFromPath(icopath);
const info_ico_img = nativeImage.createFromPath(info_ico);

const gotTheLock = app.requestSingleInstanceLock();

let testVar = 0;
let win;
let tray;


function pr_fl(obj) {

  win.webContents.send('message', obj);

}


// Function library (todo: make new file)
function sendNotif() {
  notif = new Notification({
    title: 'Looks like you\'re tilted...',
    body: 'Try taking a break. Play some TFT!',
    icon: info_ico_img
  });

  pr_fl('notif sent');


  notif.show();
}

function createWindow() {

  // Create system tray menu
  tray = new Tray(process.platform !== 'darwin' ? ico_img : icopath_png16);
  const contextMenu = Menu.buildFromTemplate([
    {label: 'Open', type: 'normal', click: function (item, window, event) {win.show();}},
    {label: 'Settings', type: 'normal'},
    {label: 'sep1', type: 'separator'},
    {label: 'Quiet mode', type: 'checkbox', checked: false},
    {label: 'sep2', type: 'separator'},
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
    icon: ico_img,
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

  autoUpdater.checkForUpdatesAndNotify();

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

  pr_fl(icopath);
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
  app.setAppUserModelId("com.ucl.momentum");

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
    } else {
      win.show();
    }
  });

  app.on('before-quit', (event) => {
    event.preventDefault();
    app.exit();
  });

  autoUpdater.on('checking-for-update', () => {
    pr_fl('Checking for update...');
  });

  autoUpdater.on('update-available', (info) => {
    pr_fl('Update available.');
  });

  autoUpdater.on('update-not-available', (info) => {
    pr_fl('Update not available.');
  });

  autoUpdater.on('error', (err) => {
    pr_fl('Error in auto-updater. ' + err);
  });

  autoUpdater.on('download-progress', (progressObj) => {
    // let log_message = "Download speed: " + progressObj.bytesPerSecond
    // log_message = log_message + ' - Downloaded ' + progressObj.percent + '%'
    // log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')'
    // pr_fl(log_message)

    pr_fl('download-progress', progressObj.percent);
  });

  autoUpdater.on('update-downloaded', (info) => {
    pr_fl('Update downloaded');
  });
}


