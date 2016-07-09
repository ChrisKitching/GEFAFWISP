import {EventEmitter} from "events";
import {RelayBabysitter} from "./RelayBabysitter";

/**
 * Defines a message in our new JSON protocol.
 */
export interface GPGJSONMessage {
    // A string identifying the name of a Lua function to call on the receiving end.
    command_id: string;

    // Arguments to pass to that function.
    args: any[]
}

/**
 * Represents a GPG message sent from the game to us.
 */
export interface GPGMessage {
    // A string identifying the message type.
    name: string;

    // The message contents/
    args: any[];
}

/**
 * A class to wrap the GPGNet connection. This connection is actually routed through the local
 * relay which decodes it into delicious JSON for us, meaning we don't have to handle the gnarly
 * original protocol, but a prettier JSON-ified one.
 *
 * There are two ways to send messages into the game: GPG's original functionality (exposed via the
 * send method) which allows you to invoke certain top-level functions in the Lua code, and our
 * extended JSON protocol which allows you to do something similar, but doesn't enforce a hard
 * coded whitelist of functions that may be called (and only allows the calling of functions in a
 * special MESSAGE_HANDLERS array in Lua-land.
 */
export class GPGNetConnection extends EventEmitter {
    constructor(relay: RelayBabysitter) {
        
    }
    
    send(command: string, args:any[]) {

    }

    /**
     * Send a JSON message into GPGNet. This extends the GPGNet protocol to allow receipt of
     * arbitrary JSON objects.
     */
    sendJSON(message: GPGJSONMessage) {
        let str = JSON.stringify(message);

        // Break the message up into 4061 character chunks: that's the largest that can be received
        // by the target in one go.
        let chunks = [];
        while (str.length > 4061) {
            let chunk = str.slice(0, 4061);
            str = str.slice(4061);
            chunks.push(chunk);
        }

        chunks.push(str);

        // Feed all the chunks into the game, using one of the parameters as a sequence number.
        for (let i:number = 0; i < chunks.length; i++) {
            this.send("CreateLobby", [
                i,
                -1, // Indicates we are using this protocol, and this isn't a real "CreateLobby".
                chunks[i],
                chunks.length,
                1   // Unused
            ])
        }
    }
}
