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
    browser:WebContents;

    // Your own username.
    nick: string;

    /**
     * Connect, authenticate with NickServ, and join the requested channels.
     *
     * @param nickname Account nickname.
     * @param user_id Account id.
     * @param password Account password.
     * @param channels Channels to join post-authentication.
     */
    authenticateAndConnect(nickname: string, user_id: string, password:string, channels:string[]) {
        this.nick = nickname;
        this.ircClient = new Client(pkgconfig.SERVERS.IRC.HOST, nickname, {
            port:pkgconfig.SERVERS.IRC.PORT,
            userName: user_id,
            realName: 'FA Forever Client',
            autoConnect:false,
            showErrors:true,
            debug:true
        });

        // The NickServ password that the server expects is md5(sha256(password)).
        // ...
        let hashed:string = createHash('sha256').update(password, 'utf8').digest('hex');
        hashed = createHash('md5').update(hashed, 'utf8').digest('hex');

        // This will auto-register our nick if the server has failed to do so for us.
        let nickserv:NickServNegotiatior = new NickServNegotiatior(this.ircClient, nickname, hashed, "user+" + nickname + "@faforever.com");

        // Passes in the actual nick we ended up with post-argument.
        nickserv.once('ready', (nick:string) => {
            // Join the channels now we're authenticated (and hence allowed to do so).
            channels.forEach((channel:string) => this.ircClient.join(channel));
        });

        this.ircClient.connect();
    }

    private handleAction(from:string, to:string, text:string) {
        let browserEvent:IrcMessages.Action = <IrcMessages.Action> {
            from: from,
            target: to,
            action: text,
        };

        this.browser.send("irc_action", browserEvent);
    }

    private handleMessage(nick:string, to:string, text:string) {
        let browserEvent:IrcMessages.PublicMessage = <IrcMessages.PublicMessage> {
            from: nick,
            message: text,
            channel: to
        };

        this.browser.send("irc_message", browserEvent);
    }

    constructor(nickname:string, user_id: string, password:string, channels:string[], webContents:WebContents) {
        this.authenticateAndConnect(nickname, user_id, password, channels);

        this.browser = webContents;

        // /me messages.
        this.ircClient.on('action', (from:string, to:string, text:string, message:any) => {
            this.handleAction(from, to, text);
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
            this.handleMessage(nick, to, text);
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

            // Echo messages to yourself, since IRC doesn't do this.
            this.handleAction(this.nick, target, content);
        });

        ipcMain.on('irc_message', (event: any, target:string, content:string) => {
            this.ircClient.say(target, content);

            // Echo messages to yourself, since IRC doesn't do this.
            this.handleMessage(this.nick, target, content);
        });
    }
}
