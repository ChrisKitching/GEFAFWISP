import {EventEmitter} from "events";
import {config} from "../config";
import * as MessageTypes from "./MessageTypes";
import {Socket} from "net";
var iconv = require('iconv-lite');


/**
 * Represents a connection to the main FAF server.
 */
export class LobbyConnection extends EventEmitter {
    private socket:Socket;

    /**
     * Send a message to the server.
     */
    send(message:MessageTypes.OutboundMessage) {
        let buf:Buffer = iconv.encode(JSON.stringify(message), 'utf16-be');
        let realLength = buf.length;

        // Length-prefix it. This requires us to write the four byte length into the start of the
        // array. Doing so in JS seems to be remarkably unpleasant.
        let finalBuf:Buffer = new Buffer(realLength + 8);

        // Omit redundant outer length value (TODO: GEFAFWISP #2)
        finalBuf.writeInt32BE(realLength + 4, 0);
        finalBuf.writeInt32BE(realLength, 4);
        buf.copy(finalBuf, 8);

        console.log(finalBuf.toString());

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

    }

    // Handler functions for particular message types that we process internally.

    /**
     * Handle a session message from the server. This leads to us entering the "connected" state.
     * The next step is for the login function to be called.
     * @param msg
     */
    handleSession(msg: MessageTypes.Session) {
        // Use the session ID to get the uid (this is all we need it for).

    }

    /**
     * Handle a message from the server. Figures out the type and emits an appropriate event (or
     * handles it internally, if appropriate).
     * @param msg Exactly one json message fromthe server.
     */
    handleMessage(msg:string) {
        console.log("Server message:");
        console.log(msg);

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
            // TODO: The rest of the protocol.
        }
    }

    /**
     * Unpack a message bundle from the server and pass the parts to handleMessage.
     * @param str The message bundle from the server.
     */
    unpackMessages(str:string) {
        let buf = Buffer.from(str);
        console.log(buf);

        let offset = 0;

        // Assumes a whole number of messages have been received.
        while (offset < buf.length) {
            // Extract the next message and process it.
            let msgLength = buf.readInt32BE(offset);
            offset += 4;
            this.handleMessage(buf.toString("utf-8", offset, offset+msgLength));
            offset += msgLength;
        }
    }

    /**
     * Connect to the server. We declare that we are "connected" after we have opened a socket and
     * got a reply to our ask_session message. This ensures our client is a version the server is
     * prepared to talk to before we send any events to the user and start trying to do things.
     */
    connect() {
        this.socket = new Socket();
        this.socket.setEncoding(null);
        this.socket.setKeepAlive(true);
        this.socket.connect(config.SERVERS.LOBBY.PORT, config.SERVERS.LOBBY.HOST);
        this.socket.on("connect", () => {
            // The version check and session acquisition message.
            this.send(<MessageTypes.AskSession> {
                "command": "ask_session",
                "version": config.VERSION,
                "user_agent": "faf-client"
            })
        });

        // TODO: UTF-8-ify.

        // We stream the socket into a decoder, which emits a data event every time a complete
        // string is found.
        var converterStream = iconv.decodeStream('utf16-be');
        this.socket.pipe(converterStream);
        converterStream.on('data', (data:string) => {this.unpackMessages(data)});
    }
}
