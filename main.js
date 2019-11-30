// Momemtum electron main script

const electron = require('electron');
const { autoUpdater } = require("electron-updater");
const path = require('path');
const url = require('url');
const storage = require('electron-json-storage');

const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const ipc = electron.ipcMain;
const Tray = electron.Tray;
const Menu = electron.Menu;
const Notification = electron.Notification;
const nativeImage = electron.nativeImage;

// Constants
const icon_ext = process.platform !== 'darwin' ? '.ico' : '.icns';
const icopath = __dirname + '/img/8ball' + icon_ext;
const icopath_png16 = __dirname + '/img/uncompressed/8ball_16.png';
const icopath_png32 = __dirname + '/img/uncompressed/8ball_32.png';
const icopath_png64win = __dirname + '/img/8ball_banner_fin2_64win.png';
const info_ico = __dirname + '/img/8ball_info' + icon_ext;
const ico_img = nativeImage.createFromPath(icopath);
const ico_img32 = nativeImage.createFromPath(icopath_png64win);
const info_ico_img = nativeImage.createFromPath(info_ico);
const gotTheLock = app.requestSingleInstanceLock();

// Global variables
let testVar = 0;
let win;
let tray;
let profiles;

let active_profile;
let rdist;

let notifs = true;
let sounds = true;


// Messaging events between main and renderer

ipc.on('asynchronous-message', (event, arg) => {
  console.log(arg) // prints "ping"
});
ipc.on('set', (event, arg) => {
  [name, value] = arg.split(':');
  switch (name) {
    case "notifs":
      notifs = value == "true";
      update_profile();
    case "sounds":
      sounds = value == "true";
      update_profile();
  }
});


// Function library

function pr_fl(obj) {
  console.log(obj);
  win.webContents.send('message', obj);
}
function isEmpty(obj) {
  return Object.entries(obj).length === 0 && obj.constructor === Object;
}
function get(key) {
  storage.get(key, function(error, data) {
    if (error) {
      pr_fl("Storage get() error: ");
      pr_fl(key);
      pr_fl(error);
      throw error;
    }
    return data;
  });
}
function set(key, obj) {
  storage.set(key, obj, function(error) {
    if (error) {
      pr_fl("Storage set() error: ");
      pr_fl(key);
      pr_fl(error);
      throw error;
    }
  });
}

// Request role_dist and acc hash for a particular summoner
// Request existing data for an acc - influence, momentum, and momentum/elo history (compute if necessary), (compute partial responses & tag as incomplete)
function request_acc(acc_hash, region) {
  return ["abc123", "hide on bush", "KR", 26, 500, 1565128523, ["LP HISTORY - UPDATE FROM OPGG IF "], [0.2, 0.2, 0.2, 0.2, 0.2], [0.55, 0.42, 0.63, 0.57, 0.48], [0.52, 0.35, 0.6, 0.55, 0.45]];
}
// Request a momentum/elo update
function request_summoner(summoner, region) {
  return ["abc123", "hide on bush", "KR", 26, 500, 1565128523, ["OPGG LP HISTORY IF REQUESTED"], [0.2, 0.2, 0.2, 0.2, 0.2], [0.55, 0.42, 0.63, 0.57, 0.48], [0.52, 0.35, 0.6, 0.55, 0.45]];
}

// Generate a new profile from a summoner name, with default preferences
function new_profile(summoner) {
  [acc_hash, role_dist] = request_role_dist(summoner);
  rdist = role_dist;
  const profile = {
    notifs: "none",
    sounds: "none",
    role_dist: rdist
  };
  profiles[acc_hash] = profile;
  activate_profile(acc_hash);
}
function delete_profile(id) {
  delete profiles[id];
  if (active_profile === id) {
    if (isEmpty(profiles)) {
      active_profile = null;
    } else {
      activate_profile(Object.keys(profiles)[0]);
    }
  }
}
function load_profiles() {
  const prof_store = get("profiles");
  if (!isEmpty(prof_store)) {
    profiles = prof_store.profiles;
    activate_profile(prof_store.last_active);
  }
}
function activate_profile(id) {
  active_profile = id;
  const prof = profiles[id];

  const notifs_ = "notifs" in prof ? prof.notifs : undefined;
  if (notifs_ === "true" || notifs_ === "false") {
    notifs = notifs_;
  }
  const sounds_ = "sounds" in prof ? prof.sounds : undefined;
  if (sounds_ === "true" || sounds_ === "false") {
    sounds = sounds_;
  }
  if ("role_dist" in prof) {
    rdist = prof.role_dist;
  }
}
function update_profile() {
  if (active_profile !== null) {
    store_profile();
    save_profiles();
  }
}
function store_profile() {
  // Set current profile in profiles obj
  const profile = {
    notifs: "" + notifs,
    sounds: "" + sounds,
  };
  profiles[active_profile] = profile;
}
function save_profiles() {
  set('profiles', {
    last_active: active_profile,
    profiles: profiles,
  });
}
function switch_profile(id) {
  store_profile();
  activate_profile(id);
  save_profiles();
}

function sendNotif() {
  notif = new Notification({
    title: 'Looks like you might be tilted :(',
    body: 'Try taking a break for 5 minutes    (+1.8 Momentum)',
    silent: !sounds,
    icon: ico_img32
    // icon: info_ico_img
  });
  notif.show();
  pr_fl('notif sent');
}

function createWindow() {
  // Create system tray menu
  tray = new Tray(process.platform !== 'darwin' ? ico_img : icopath_png16);
  const contextMenu = Menu.buildFromTemplate([
    {label: 'Open', type: 'normal', click: function (item, window, event) {win.show();}},
    {label: 'Settings', type: 'normal'},
    {label: 'sep1', type: 'separator'},
    {label: 'Quiet mode', type: 'checkbox', checked: false, enabled: false},
    {label: 'Disable notifications', type: 'checkbox', checked: false},
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
    // width: 640 + 350,
    width: 640,
    height: 480,
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
  // win.webContents.openDevTools();

  // win.on('closed', () => {
  //   win = null;
  // })

  // Try to load preferences from storage
  // load_profile();

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


