import {app, BrowserWindow} from "electron";
import {LobbyConnection} from "./src/net/lobbyconnection";
import {IrcClient} from './irc';

let mainWindow: Electron.BrowserWindow;
let ircClient: IrcClient;

app.on('ready', function () {
  mainWindow = new BrowserWindow({width: 1000, height: 700});
  mainWindow.loadURL('file://' + __dirname + '/public/index.html');
  (mainWindow as any).openDevTools();
  
  mainWindow.on('closed', function () {
    mainWindow = null;
  });

  // TODO: Maybe move.
  let conn: LobbyConnection = new LobbyConnection();
  conn.on("connect", () => {console.log("Buwhaha")});
  conn.connect();

  ircClient = new IrcClient('Sheeo_1', ['#test_derp'], mainWindow.webContents);
});
