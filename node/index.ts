import {app, BrowserWindow, ipcMain} from "electron";
import {LobbyConnection} from "./src/net/lobbyconnection";
import {IrcClient} from "./src/irc";
import {Config} from "./src/config"
import * as MessageTypes from "./src/net/MessageTypes";
import IpcMainEvent = Electron.IpcMainEvent;

let mainWindow:Electron.BrowserWindow;
let ircClient:IrcClient;

/**
 * Ensure only one GEFAFWISP instance is running.
 */
function ensureSingleInstance() {
    // The callback runs in the primary process if a second copy is running.
    if (app.makeSingleInstance((cmd, wDir) => {
        // This is called in the older of the two processes when someone tries to open GEFAFWISP
        // when it is already running.
        if (mainWindow.isMinimized()) {
            mainWindow.restore();
        }

        mainWindow.focus();
    })) {
        // If we get here, another instance of GEFAFWISP is running, and we should stop. The other
        // branch has been triggered in the other application.
        app.quit();
        return;
    }
}

/**
 * Returns true if a username/password is saved. If not, we need to show the login screen at once.
 */
function haveSavedCredentials() {
    return Config.get("savedUsername") != undefined && Config.get("savedPassword") != undefined;
}

/**
 * Create, but do not show the UI. It will be shown in a moment when we decide what we want to do,
 * and after we've registered the listeners that allow the UI to talk to us without breaking stuff.
 */
function createUI() {
    mainWindow = new BrowserWindow({
        width: 1000,
        height: 700,
        center: true,
        frame: false,
        title: "Forged Alliance Forever"
    });
    mainWindow.loadURL('file://' + __dirname + '/../browser/public/index.html');
    (mainWindow as any).openDevTools();

    mainWindow.on('closed', function () {
        mainWindow = null;
    });
}

/**
 * Open the connection to the main FAF server, and set up event listeners for the UI to send events
 * to us.
 */
function connectToServer() {
    let conn:LobbyConnection = new LobbyConnection(mainWindow.webContents);

    // Expose the ability to send messages from Browser-land.
    ipcMain.on('send_to_server', (event: any, msg: MessageTypes.OutboundMessage) => {
        conn.send(msg);
    });

    // The user's password will be needed again for NickServ registration, ickily enough.

    // We create the on welcome handler here (slightly strangely) so we don't have to do evil
    // contortions to get the password into it.
    let createLoginListener = function(name:string, password:string) {
        // On a successful login, show the main UI. Unsuccessful login messages from the server are
        // handled directly by the login screen component. Here in node-land we just handle the two
        // events that have to do with swapping between the two ReactDOM.render calls in entry.tsx, and
        // mostly leave the browser alone once we're done fucking about with that.
        conn.on("welcome", (msg: MessageTypes.Welcome) => {
            connectToIRC(name, msg.me.id.toString(), password);
            mainWindow.webContents.send('show_main_ui');
            mainWindow.show();
        });
    };

    // Special event for login, since it needs custom logic in addition to just sending the message
    ipcMain.on('login', (event: any, username:string, password:string, remember:boolean) => {
        createLoginListener(username, password);
        conn.login(username, password);

        if (remember) {
            Config.put("savedUsername", username);
            Config.put("savedPassword", password);
        }
    });

    conn.on("connect", () => {
        // If we have saved credentials, use them now.
        if (haveSavedCredentials()) {
            let savedUsername:string = Config.get("savedUsername");
            let savedPassword:string = Config.get("savedPassword");

            createLoginListener(savedUsername, savedPassword);
            conn.login(savedUsername, savedPassword);
        }

        // If not, we're already showing the login screen, so we just wait for it to call login.
    });

    // Show the login screen if the saved credentials turn out to be wrong (you got banned etc.)
    if (haveSavedCredentials()) {
        conn.once("authentication_failed", () => {
            mainWindow.webContents.send('show_login_ui');
        });
    }

    conn.connect();
}

function connectToIRC(nick: string, user_id: string, password:string) {
    // TODO: Receive the list of channels from the server in welcome and pass them in here.
    // For now we'll just ignore the channels the server sends us completely and only join this one.
    ircClient = new IrcClient(nick, user_id, password, ['#aeolus'], mainWindow.webContents);
}

app.on('ready', function () {
    // Abort if GEFAFWISP is already running.
    ensureSingleInstance();

    Config.load();
    createUI();

    // To avoid a race condition, we have to wait for the construction of the browser process
    // before we can continue. This doesn't wait for the page to be rendered, just for the listeners
    // we talk to to be registered (see entry.tsx).
    // Otherwise it is in principle possible for the server to send us messages that we try to
    // propagate into browser land before we've started the browser.
    ipcMain.on("browser-ready", (event: any) => {
        connectToServer();

        // Show login screen if we don't have any saved credentials to use.
        if (!haveSavedCredentials()) {
            console.log("Nothing saved");
            mainWindow.webContents.send('show_login_ui');
            mainWindow.show();
        }
    });

    // Listen to window management requests from browser-land.
    ipcMain.on("quit", (event: any) => {
        app.quit();
    });

    ipcMain.on("maximise", (event: any) => {
        // This one is a toggle.
        if (!mainWindow.isMaximized()) {
            mainWindow.maximize();
        } else {
            mainWindow.unmaximize();
        }
    });

    ipcMain.on("minimise", (event: any) => {
        mainWindow.minimize();
    });
});
