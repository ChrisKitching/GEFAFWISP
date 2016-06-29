import {EventEmitter} from "events";
import {execSync} from "child_process";
import {createHash} from "crypto";
import {pkgconfig} from "../config";
import * as MessageTypes from "./MessageTypes";
import {Socket} from "net";
import WebContents = Electron.WebContents;
import {BufferWrapper} from "./BufferWrapper";
var iconv = require('iconv-lite');


/**
 * Represents a connection to the main FAF server.
 */
export class LobbyConnection extends EventEmitter {
    private socket:Socket;
    private uid:string;

    // Where in browser-land to send all the events.
    private theWebContents:WebContents;

    constructor(web:WebContents) {
        super();
        this.theWebContents = web;
    }

    /**
     * Send a message to the server.
     */
    send(message:MessageTypes.OutboundMessage) {
        console.log("Sending: " + JSON.stringify(message));

        let buf:Buffer = iconv.encode(JSON.stringify(message), 'utf16-be');
        let realLength = buf.length;

        // Length-prefix it. This requires us to write the four byte length into the start of the
        // array. Doing so in JS seems to be remarkably unpleasant.
        let finalBuf:Buffer = new Buffer(realLength + 8);

        // Omit redundant outer length value (TODO: GEFAFWISP #2)
        finalBuf.writeInt32BE(realLength + 4, 0);
        finalBuf.writeInt32BE(realLength, 4);
        buf.copy(finalBuf, 8);

        // This utf-8 encodes the string.
        this.socket.write(finalBuf);
    }

    /**
     * Send a login request to the server with the given username and password.
     *
     * @param username
     * @param password (in plaintext)
     */
    login(username:string, password:string) {
        let hashed:string = createHash('sha256').update(password, 'utf8').digest('hex');
        this.send(<MessageTypes.Login> {
            "command": "hello",
            "login": username,
            "password": hashed,
            "unique_id": this.uid
        })
    }

    // Handler functions for particular message types that we process internally.

    /**
     * Handle a session message from the server. This leads to us entering the "connected" state.
     * The next step is for the login function to be called.
     * @param msg
     */
    handleSession(msg: MessageTypes.Session) {
        // Use the session ID to get the uid (this is all we need it for).
        this.uid = execSync("./bin/uid " + msg.session).toString();
        this.emit("connect");
    }

    /**
     * Handle a message from the server. Figures out the type and emits an appropriate event (or
     * handles it internally, if appropriate).
     * @param msg Exactly one json message fromthe server.
     */
    handleMessage(msg:string) {
        console.log("Server message: " + msg);

        // Ridiculous special case for the "PING" message.
        if (msg == "PING") {
            return;
        }

        let json:any = JSON.parse(msg);

        // Figure out which sort of message it is, create an appropriately-typed inteface from it,
        // and emit an event to both Node and the renderer (or process it internally).
        switch (json.command) {
            case "session":
                this.handleSession(<MessageTypes.Session> json);
                break;
            case "update":
                this.emit("update", <MessageTypes.Update> json);
                this.theWebContents.send("update", <MessageTypes.Update> json);
                break;
            case "authentication_failed":
                this.emit("authentication_failed", <MessageTypes.AuthenticationFailed> json);
                this.theWebContents.send("authentication_failed", <MessageTypes.AuthenticationFailed> json);
                break;
            case "welcome":
                this.emit("welcome", <MessageTypes.Welcome> json);
                this.theWebContents.send("welcome", <MessageTypes.Welcome> json);
                break;
            case "player_info":
                this.emit("player_info", <MessageTypes.PlayerInfo> json);
                this.theWebContents.send("player_info", <MessageTypes.PlayerInfo> json);
                break;
            case "mod_info":
                this.emit("mod_info", <MessageTypes.ModInfo> json);
                this.theWebContents.send("mod_info", <MessageTypes.ModInfo> json);
                break;
            case "social":
                this.emit("social", <MessageTypes.Social> json);
                this.theWebContents.send("social", <MessageTypes.Social> json);
                break;
            case "game_info":
                // Convert the single-game form of the message into the array form for consistency.
                // TODO: Make the server send only the array form of this message.
                if (!("games" in json)) {
                    json = {command: "game_info", games: [json]}
                }

                this.emit("game_info", <MessageTypes.GameInfo> json);
                this.theWebContents.send("game_info", <MessageTypes.GameInfo> json);
                break;

            // TODO: The rest of the protocol.
        }
    }

    /**
     * Unpack a message bundle from the server and pass the parts to handleMessage.
     * @param buf The message bundle from the server.
     */
    unpackMessages(buf:Buffer) {
        let offset = 0;

        // Assumes a whole number of messages have been received.
        while (offset < buf.length) {
            // Extract the next message and process it.
            let msgLength = buf.readInt32BE(offset);
            offset += 4;

            // Extract the payload string.
            let utf16Buffer:Buffer = buf.slice(offset, offset + msgLength);

            // Decode it as utf16-be and pass it to the actual handlers.
            this.handleMessage(iconv.decode(utf16Buffer, 'utf16-be'));

            offset += msgLength;
        }
    }

    /**
     * Connect to the server. We declare that we are "connected" after we have opened a socket and
     * got a reply to our ask_session message. This ensures our client is a version the server is
     * prepared to talk to before we send any events to the user and start trying to do things.
     */
    connect() {
        // Must be larger than the largest message we can ever receive, or we're fucked.
        let msgBuffer:BufferWrapper = new BufferWrapper(new Buffer(2000000));

        // TODO: UTF-8-ify.
        this.socket = new Socket();
        this.socket.setKeepAlive(true);
        this.socket.connect(pkgconfig.SERVERS.LOBBY.PORT, pkgconfig.SERVERS.LOBBY.HOST);
        this.socket.on("connect", () => {
            // The version check and session acquisition message.
            this.send(<MessageTypes.AskSession> {
                "command": "ask_session",
                "version": pkgconfig.VERSION,
                "user_agent": "faf-client"
            })
        });

        // Length remaining to extract from this block.
        let lengthToRead = -1;
        this.socket.on('data', (data:Buffer) => {
            msgBuffer.append(data);

            // console.error("Paused: " + this.socket.)
            if (lengthToRead == -1) {
                // Check if there are enough bytes yet...
                let lengthBuffer:Buffer = msgBuffer.readExactly(4);
                if (lengthBuffer == null) {
                    return;
                }

                lengthToRead = lengthBuffer.readUInt32BE(0);
            }

            // Wait for enough bytes...
            let block:Buffer = msgBuffer.readExactly(lengthToRead);
            if (block == null) {
                return;
            }

            lengthToRead = -1;
            this.unpackMessages(block);
        });
    }
}
