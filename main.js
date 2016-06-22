var app = require('app');
var BrowserWindow = require('browser-window');

app.on('window-all-closed', function () {
    if (process.platform != 'darwin') {
        app.quit();
    }
});

app.on('ready', function () {
    mainWindow = new BrowserWindow({width: 1000, height: 700});
    mainWindow.loadURL('file://' + __dirname + '/public/index.html');
    mainWindow.openDevTools();
    mainWindow.on('closed', function () {
        mainWindow = null;
    });
});
