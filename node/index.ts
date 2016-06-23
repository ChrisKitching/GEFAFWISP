import {app, BrowserWindow} from "electron";
import {LobbyConnection} from "./src/net/lobbyconnection";

let mainWindow:any;

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
    
    // TODO: Maybe move.
    let conn:LobbyConnection = new LobbyConnection();
    conn.on("connect", () => {console.log("Buwhaha")});
    conn.connect();
});
