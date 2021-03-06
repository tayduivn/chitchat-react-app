import * as electron from 'electron';
const AutoLaunch = require('auto-launch');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const path = require('path');
const url = require('url');
let mainWindow;
function createWindow() {
    mainWindow = new BrowserWindow({ width: 1280, height: 720 });
    const startUrl = process.env.ELECTRON_START_URL || "https://chitchats.ga";
    mainWindow.loadURL(startUrl);
    mainWindow.webContents.on('did-finish-load', () => {
        mainWindow.webContents.send('ping', 'whoooooooh!');
        app.dock.setBadge("");
    });
    mainWindow.on('closed', function () {
        mainWindow = null;
    });
}
app.on('ready', createWindow);
app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
app.on('activate', function () {
    if (mainWindow === null) {
        createWindow();
    }
});
const chitchatAutoLauncher = new AutoLaunch({
    name: app.getName(),
    mac: {
        useLaunchAgent: true
    }
});
chitchatAutoLauncher.enable();
chitchatAutoLauncher.isEnabled().then(function (isEnabled) {
    console.log("AutoLaunch", isEnabled);
    if (isEnabled) {
        return;
    }
    chitchatAutoLauncher.enable();
}).catch(function (err) {
});
