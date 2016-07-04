import {Client} from "irc";
import {pkgconfig} from "../config"
import {createHash} from "crypto";
import * as IrcMessages from "./IrcMessages";
import {ipcMain} from "electron";
import {NickServNegotiatior} from "./NickServNegotiatior";
import WebContents = Electron.WebContents;

/**
 * This class has the job of talking to the IRC server. Most of the actual work gets done in the
 * browser process ChatModel, however (notably because that's also where the player service is).
 */
export class IrcClient {
    ircClient:Client;
    onMessage:(message:string) => void;

    /**
     * Connect, authenticate with NickServ, and join the requested channels.
     *
     * @param username Your account username.
     * @param password Your account password.
     * @param channels Channels to join post-authentication.
     */
    authenticateAndConnect(username:string, password:string, channels:string[]) {
        this.ircClient = new Client(pkgconfig.SERVERS.IRC.HOST, username, {
            port:pkgconfig.SERVERS.IRC.PORT,
            autoConnect:false,
            showErrors:true,
            debug:true
        });

        // The NickServ password that the server expects is md5(sha256(password)).
        // ...
        let hashed:string = createHash('sha256').update(password, 'utf8').digest('hex');
        hashed = createHash('md5').update(hashed, 'utf8').digest('hex');

        // This will auto-register our nick if the server has failed to do so for us.
        let nickserv:NickServNegotiatior = new NickServNegotiatior(this.ircClient, username, hashed, "user+" + username + "@faforever.com");

        // Passes in the actual nick we ended up with post-argument.
        nickserv.once('ready', (nick:string) => {
            // Join the channels now we're authenticated (and hence allowed to do so).
            channels.forEach((channel:string) => this.ircClient.join(channel));
        });

        this.ircClient.connect();
    }

    constructor(nickname:string, password:string, channels:string[], webContents:WebContents) {
        this.authenticateAndConnect(nickname, password, channels);

        // /me messages.
        this.ircClient.on('action', (from:string, to:string, text:string, message:any) => {
            let browserEvent:IrcMessages.Action = <IrcMessages.Action> {
                from: from,
                target: to,
                action: text,
            };
            webContents.send("irc_action", browserEvent);
        });

        this.ircClient.on('motd', (message:string) => {
            let browserEvent:IrcMessages.MOTD = <IrcMessages.MOTD> {
                "message": message
            };
            webContents.send("irc_motd", browserEvent);
        });

        this.ircClient.on('pm', (nick:string, text:string, message:any) => {
            let browserEvent:IrcMessages.PrivateMessage = <IrcMessages.PrivateMessage> {
                from: nick,
                message: text
            };
            webContents.send("irc_pm", browserEvent);
        });

        this.ircClient.on('message#', (nick:string, to:string, text:string, message:any) => {
            console.error("MEessage: " + nick);
            console.error("MEesage: " + text);
            console.error("MEesage: " + message);
            let browserEvent:IrcMessages.PublicMessage = <IrcMessages.PublicMessage> {
                from: nick,
                message: text,
                channel: to
            };
            webContents.send("irc_message", browserEvent);
        });

        this.ircClient.on('join', (channel:string, who:string, message:any) => {
            if (who == nickname) {
                let browserEvent:IrcMessages.ChannelJoined = <IrcMessages.ChannelJoined> {
                    channel: channel
                };
                console.error("SEND");
                webContents.send('irc_channel_joined', browserEvent);
            } else {
                let browserEvent:IrcMessages.PlayerJoined = <IrcMessages.PlayerJoined> {
                    who: who,
                    channel: channel,
                };
                webContents.send("irc_player_joined", browserEvent);
            }
        });

        this.ircClient.on('part', (channel:string, who:string, reason:string, message:any) => {
            if (who == nickname) {
                let browserEvent:IrcMessages.ChannelLeft = <IrcMessages.ChannelLeft> {
                    channel: channel,
                    reason: reason
                };
                webContents.send("irc_channel_left", browserEvent);
            } else {
                let browserEvent:IrcMessages.PlayerLeft = <IrcMessages.PlayerLeft> {
                    who: who,
                    reason: reason,
                    channel: channel
                };
                webContents.send("irc_player_left", browserEvent);
            }
        });

        // Sent when a user's name is changed.
        this.ircClient.on('nick', (oldnick:string, newnick:string, channels:string[], message:any) => {
            let browserEvent:IrcMessages.NameChange = <IrcMessages.NameChange> {
                who: oldnick,
                newName: newnick,
                channels: channels
            };
            webContents.send("irc_name_change", browserEvent);
        });

        // List of users in a channel.
        this.ircClient.on('names', (channel:string, names:string[], message:any) => {
            let users:string[] = [];
            let moderators:string[] = [];
            for (var name in names) {
                if (names[name] == "@") {
                    moderators.push(name);
                } else {
                    users.push(name);
                }
            }

            users = moderators.concat(users);

            let browserEvent:IrcMessages.Names = <IrcMessages.Names> {
                channel: channel,
                names: users,
                moderators: moderators
            };
            webContents.send("irc_names", browserEvent);
        });

        this.ircClient.on('error', console.error);
        // this.ircClient.on('raw', console.log);

        // Listen for requests from browser-land.

        ipcMain.on('irc_action', (event: any, target:string, content:string) => {
            this.ircClient.action(target, content);
        });

        ipcMain.on('irc_message', (event: any, target:string, content:string) => {
            this.ircClient.say(target, content);
        });
    }
}
