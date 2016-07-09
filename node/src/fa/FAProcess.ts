import {Config} from "../config/index";
import * as path from  "path";
import {ChildProcess, spawn} from "child_process";
import {RelayBabysitter} from "./RelayBabysitter";
import {EventEmitter} from "events";
import {GPGNetConnection} from "./GPGNetConnection";

/**
 * A singleton to manage the lifecycle of the FA process and associated gubbins.
 *
 * When stared, this will:
 * - Launch the local relay.
 * - Wait for it to print "Ready" indicating it is listening.
 * - Initialise the GPGNetConnection to the local relay.
 * - Launch FA.exe
 *
 * FA.exe will at some later point send us the "Idle" GPGNet message, indicating it is ready to
 * receive instructions via GPGNet to make it actually do something.
 */
export class FAProcessManager extends EventEmitter {
    // A Node ChildProcess instance representing the game.
    process: ChildProcess;
    localRelay: RelayBabysitter;
    GPGNet: GPGNetConnection;

    constructor() {
        this.localRelay = new RelayBabysitter();
    }

    /**
     * Start the game process
     */
    start() {
        this.localRelay.on("ready", (gpgnetPort:number) => {
            this.GPGNet = new GPGNetConnection(this.localRelay);
            this.startFA(gpgnetPort);
        });

        this.localRelay.start();
    }

    /**
     * Launch ForgedAlliance.exe, configured to connect to GPGNet on localhost at the given port.
     * This port should have been returned from the local relay after it set up its listener.
     */
    private startFA(gpgnetPort: number) {
        let options:any = {
            cwd: Config.get("binaryPath"),
            stdio: "ignore",
        };

        let arguments:string[] = [
            "/nobugreport",                    // Disable the defunct GPG crash reporter.
            "/init", "something.lua",          // TODO: Initfile generation.
            "/gpgnet 127.0.0.1:" + gpgnetPort, // Proxy GPGNet through the local relay.
            "/log", Config.get("gameLogFile")

            // TODO: Local replay streaming.
            // "/savereplay", '"gpgnet://localhost/' + str(game_info['uid']) + "/" + str(game_info['recorder']) + '.SCFAreplay"')

        ];

        this.process = spawn(path.join(Config.get("binaryPath"), "ForgedAlliance.exe"), arguments, options);

        this.process.on('close', (code) => {
            console.info("ForgedAlliance.exe exited with code: " + code);
        });
    }
}

// This is a singleton, since only one process can ever be managed by GEFAFWISP.
let instance:FAProcessManager = new FAProcessManager();
export default instance;
