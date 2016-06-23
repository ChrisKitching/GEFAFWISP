import {app, BrowserWindow} from "electron";
import {LobbyConnection} from "./src/net/lobbyconnection";
import {IrcClient} from "./irc";
import * as MessageTypes from "./src/net/MessageTypes";

let mainWindow:Electron.BrowserWindow;
let ircClient:IrcClient;

app.on('ready', function () {
    mainWindow = new BrowserWindow({
        width: 1000,
        height: 700,
        center: true,
        frame: false,
        title: "Forged Alliance Forever"
    });
    mainWindow.loadURL('file://' + __dirname + '/public/index.html');
    (mainWindow as any).openDevTools();

    mainWindow.on('closed', function () {
        mainWindow = null;
    });

    // TODO: Maybe move.
    let conn:LobbyConnection = new LobbyConnection();
    conn.on("connect", () => {
        // TODO: Hack for testing.
        conn.login("USERNAME", "PASSWORD");
    });

    // On a successful login...
    conn.on("welcome", (msg: MessageTypes.Welcome) => {
        // TODO:
    });

    conn.connect();

    ircClient = new IrcClient('Sheeo_1', ['#test_derp'], mainWindow.webContents);
});
