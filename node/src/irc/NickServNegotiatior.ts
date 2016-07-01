import {Client} from "irc";
import {EventEmitter} from "events";

/**
 * Tracks where we are in our process of yelling at NickServ.
 */
enum State {
    READY,
    SENT_RECOVER,
    SENT_IDENTIFY,
    SENT_REGISTER,
    VICTORY,
}

// Ask for status. Determine if registered and online.
// If online, RECOVER.
// If not registered, REGISTER.
//     Go back to start.
// If not online and registered, IDENTIFY.

// If a message matches any of this, we don't care about it.
let junkPatterns = [
    /This nickname is registered and protected\.  If it is your/,
    /.+msg NickServ IDENTIFY .+/,
    /please choose a different nick\./
]


// interface InfoMessage {
//     online: boolean;
//     registered: boolean;
// }

/**
 * Device for yelling at NickServ to get you the name you want.
 */
export class NickServNegotiatior extends EventEmitter {
    ircClient: Client;
    username: string;
    password: string;
    email: string;

    // Listeners we eventually want to remove.
    listener: any;

    state: State;

    constructor(c:Client, name:string, pw:string, mail:string) {
        super();
        this.ircClient = c;
        this.username = name;
        this.password = pw;
        this.email = mail;
        this.state = State.READY;

        this.listener = (nick:string, to:string, text:string, message:any) => {
            if (nick == "NickServ") {
                this.handleMessage(text);
            }
        };

        // If someone else is using our name, the server will rename us, and the library doesn't
        // send us a rename event for this case, so we have to do this the awful way.
        // Oh, and "registered" is what the IRC library calls it's on-connection-established event.
        this.ircClient.once('registered', (message:any) => {
            // This is the name we ended up with, not necessarily the one we asked for.
            let actualName:string = message.args[0];

            if (actualName != this.username) {
                // Someone is using our name, attempt recovery.
                this.say("RECOVER " + this.username + " " + this.password);
                this.state = State.SENT_RECOVER;
            } else {
                this.tryIdentification();
            }
        });

        this.ircClient.on('notice', this.listener);
    }

    /**
     * Stick an underscore onto the name and try again.
     */
    tryAnotherName() {
        this.username += "_";
        this.ircClient.send("NICK", this.username);

        // Meh, close enough.
        this.victory();
    }

    victory() {
        this.ircClient.removeListener('notice', this.listener);
        this.emit("ready", this.username);
    }

    tryIdentification() {
        this.say("IDENTIFY " + this.password);
        this.state = State.SENT_IDENTIFY;
    }

    register() {
        this.say("REGISTER " + this.password + " " + this.email);
    }

    say(msg:string) {
        this.ircClient.say("NickServ", msg);
    }

    handleMessage(msg:string) {
        // Check if it's a message we don't care about.
        for (let i:number = 0; i < junkPatterns.length; i++) {
            if (msg.match(junkPatterns[i]) != null) {
                console.error("Pass");
                return;
            }
        }

        switch (this.state) {
            case State.SENT_RECOVER:
                // If this worked, we are now identified and have the correct name.
                if (msg == "Ghost with your nick has been killed.") {
                    // Set our name back to what we want it to be. Victory.
                    this.ircClient.send("NICK", this.username);
                    this.victory();
                } else {
                    console.error("Unable to recover NickName, trying something else...");
                    this.tryAnotherName();
                }

                break;

            case State.SENT_IDENTIFY:
                if (msg.startsWith("Password accepted")) {
                    // Victory!
                    this.victory();
                } else if (msg.indexOf("isn't registered.") != -1) {
                    // Not registered. Let's fix that.
                    this.register();
                    this.state = State.SENT_REGISTER;
                } else {
                    // Identification failed. Oh crap. Any name is better than no chat, I suppose!
                    this.username += "_";
                    this.state = State.READY;
                    this.ircClient.send("NICK", this.username);
                }

                break;

            case State.SENT_REGISTER:
                if (msg.indexOf("registered") == -1) {
                    console.error("Nick registration failed!");
                    return;
                }

                this.victory();

                break;
        }

    }
}
