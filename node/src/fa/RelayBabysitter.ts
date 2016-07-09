import {ChildProcess, spawn} from "child_process";
import {EventEmitter} from "events";
import * as path from  "path";

// Inbound message codes from the local relay. These single-letter codes are present at the start of
// every line of output printed by the relay, and indicate the type of message that is in the rest
// of the line (all messages are on one line).
let COMMAND_READY:string = "R";

/**
 * Looks after the local relay. Handles the lifecycle of the process and dispatches Node events when
 * interesting things show up on the relay's stdout.
 */
export class RelayBabysitter extends EventEmitter {
    relayProcess: ChildProcess;

    start() {
        let arguments:string[] = [
        ];

        this.relayProcess = spawn(path.join(".", "bin", "localRelay"), arguments);

        this.relayProcess.on('close', (code) => {
            console.info("Local relay exited with code: " + code);
        });

        // The local relay line-buffers for us to make our life simpler.
        this.relayProcess.stdout.on('data', (data) => {
            let command:string = data.charAt(0);
            let content:any = JSON.parse(data.slice(1));

            switch (command) {
                // Printed when the relay is done initialising and is ready to receive instructions
                // and to connect to FA.exe. GPGNetListenPort is the port the relay selected to
                // listen for GPGNet connections on (locally).
                case COMMAND_READY:
                    this.emit("ready", content.GPGNetListenPort);
                    break;
                default:
                    throw "Unexpected output from local relay: " + data;
                    break;
            }

            console.log("Relay stdout: ${data}");
        });
    }
}
