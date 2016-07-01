import {EventEmitter} from "events";
import {ipcRenderer} from 'electron';
import * as IrcMessages from "../../../node/src/irc/IrcMessages";
import {ModInfo} from "../../../node/src/net/MessageTypes";

interface Message {}

export interface NormalMessage extends Message {
    from: string;
    content: string;
}

export interface ActionMessage extends Message {
    from: string;
    content: string;
}

export interface ServerMessage extends Message {
    content: string;
}

export class Channel {
    name:string;
    users: string[];
    messages: Message[];

    constructor(name:string) {
        this.name = name;
        this.users = [];
        this.messages = [];
    }

    addMessage(message:Message) {
        this.messages.push(message);
    }

    addUser(name:string) {
        this.users.push(name);
    }

    removeUser(name:string) {
        this.users.splice(this.users.indexOf(name), 1);
    }
}

/**
 * A module to hold state about the chat.
 */
export class ChatModel extends EventEmitter {
    // Stored in an array to mirror the UI tabs (which must be ordered)
    private channels: Channel[];

    constructor() {
        super();
        this.channels = [];

        // Listen to the various events sent from node-land to do with IRC...

        // You joined a channel
        ipcRenderer.on('irc_channel_joined', (event:any, msg:IrcMessages.ChannelJoined) => {
            this.channels.push(new Channel(msg.channel));
            this.emit("channel_joined");
        });

        // User joined a channel you were in.
        ipcRenderer.on('irc_player_joined', (event:any, msg:IrcMessages.PlayerJoined) => {
            this.getChannel(msg.channel).addUser(msg.who);
            this.emit("player_joined");
        });

        // You left a channel.
        ipcRenderer.on('irc_channel_left', (event:any, msg:IrcMessages.ChannelLeft) => {
            this.channels.splice(this.channels.findIndex((c:Channel) => c.name == msg.channel), 1);
            this.emit("channel_left");
        });

        // Someone left a channel you were in.
        ipcRenderer.on('irc_player_left', (event:any, msg:IrcMessages.PlayerLeft) => {
            let channel:Channel = this.getChannel(msg.channel);
            channel.removeUser(msg.who);
            this.emit("player_left");
        });

        // Public message received.
        ipcRenderer.on('irc_message', (event:any, msg:IrcMessages.PublicMessage) => {
            // Messages can be sent to more than one channel at once, in principle.
            for (let i:number = 0; i < msg.channels.length; i++) {
                let channel:Channel = this.getChannel(msg.channels[i]);
                channel.addMessage(<NormalMessage> {content: msg.message, from: msg.from});
                this.emit("message");
            }
        });

        // Private message received.
        ipcRenderer.on('irc_pm', (event:any, msg:IrcMessages.PrivateMessage) => {
            // We create a "channel" named after the user.
            let channel:Channel = this.getChannel(msg.from);
            if (channel == undefined) {
                channel  = new Channel(msg.from);
                this.channels.push(channel);
            }

            channel.addMessage(<NormalMessage> {content: msg.message, from: msg.from});
        });

        // Incoming /me messages.
        ipcRenderer.on('irc_action', (event:any, msg:IrcMessages.Action) => {
            let channel:Channel = this.getChannel(msg.target);

            channel.addMessage(<ActionMessage> {from:msg.from, content: msg.action});
        });

        // Mesage of the day.
        ipcRenderer.on('motd', (event:any, msg:IrcMessages.MOTD) => {
            // Write message to all channels.
            this.channels.forEach((c:Channel) => c.addMessage(<ServerMessage> {content:msg.message}));
        })
    }

    getChannel(name:string):Channel {
        return this.channels.find((c:Channel) => c.name == name);
    }

    getChannels():Channel[] {
        return this.channels;
    }
}
