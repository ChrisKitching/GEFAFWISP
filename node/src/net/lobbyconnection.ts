import {EventEmitter} from "events";
import {execSync} from "child_process";
import {createHash} from "crypto";
import {config} from "../config";
import * as MessageTypes from "./MessageTypes";
import {Socket} from "net";
var iconv = require('iconv-lite');


/**
 * Represents a connection to the main FAF server.
 */
export class LobbyConnection extends EventEmitter {
    private socket:Socket;
    private uid:string;

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
        // and emit an event (or process it internally).
        switch (json.command) {
            case "session":
                this.handleSession(<MessageTypes.Session> json);
                break;
            case "update":
                this.emit("update", <MessageTypes.Update> json);
                break;
            case "welcome":
                this.emit("welcome", <MessageTypes.Welcome> json);
                break;
            case "player_info":
                this.emit("player_info", <MessageTypes.PlayerInfo> json);
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
            console.error("Message of length: " + msgLength);
            offset += 4;

            // Extract the payload string.
            let utf16Buffer:Buffer = buf.slice(offset, offset + msgLength);

            // Decode it as utf16-be and pass it to the actual handlers.
            this.handleMessage(iconv.decode(utf16Buffer, 'utf16-be'));

            offset += msgLength;
        }
    }

    /**
     * Read exactly length bytes from socket. If there are not that many bytes available to be read,
     * return null.
     *
     * Just to keep life interesting, the default behaviour of Socket is to sometimes return more
     * than you ask for. This can cause all kinds of badness.
     *
     * @param socket Socket to read from.
     * @param length Number of bytes to read.
     */
    readExactly(socket:Socket, length:number):Buffer {
        // There is a hole in the type system here: typings say this returns a Buffer, but sometimes
        // it's a string (or null).
        let stuffRead:any = this.socket.read(length);

        // Null is returned by the socket if there are not enough bytes.
        if (stuffRead == null) {
            return null;
        }

        // Now we have _at least_ length many bytes in the buffer stuffRead. Let's now, hilariously,
        // put back the extra ones.
        let block:Buffer = new Buffer(stuffRead);

        let extraBuf = block.slice(length);
        socket.unshift(extraBuf);

        return block.slice(0, length);
    }

    /**
     * Connect to the server. We declare that we are "connected" after we have opened a socket and
     * got a reply to our ask_session message. This ensures our client is a version the server is
     * prepared to talk to before we send any events to the user and start trying to do things.
     */
    connect() {
        // TODO: UTF-8-ify.
        this.socket = new Socket();
        this.socket.setKeepAlive(true);
        this.socket.connect(config.SERVERS.LOBBY.PORT, config.SERVERS.LOBBY.HOST);
        this.socket.pause();
        this.socket.on("connect", () => {
            // The version check and session acquisition message.
            this.send(<MessageTypes.AskSession> {
                "command": "ask_session",
                "version": config.VERSION,
                "user_agent": "faf-client"
            })
        });

        // Length remaining to extract from this block.
        let lengthToRead = -1;
        this.socket.on('readable', () => {
            // console.error("Paused: " + this.socket.)
            if (lengthToRead == -1) {
                // Check if there are enough bytes yet...
                let lengthBuffer:Buffer = this.readExactly(this.socket, 4);
                if (lengthBuffer == null) {
                    return;
                }

                lengthToRead = lengthBuffer.readUInt32BE(0);
            }

            // Wait for enough bytes...
            let block:Buffer = this.readExactly(this.socket, lengthToRead);
            if (block == null) {
                return;
            }

            lengthToRead = -1;
            this.unpackMessages(block);
        });
    }
}
