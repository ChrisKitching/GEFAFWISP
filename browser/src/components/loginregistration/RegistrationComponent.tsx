import 'jquery';
import 'bootstrap';
import {ipcRenderer} from 'electron';
import * as MessageTypes from "../../../../node/src/net/MessageTypes";
import * as classNames from 'classnames';
const style: any = require('../../styles/registration.scss');

import * as React from "react";
import EventEmitter = Electron.EventEmitter;
import {PreAppStage} from "./PreApp";

interface RegistrationProps {
    // An EventEmitter connected to the main UI. This may be used to change the UI to another screen
    eventSink: EventEmitter;
}

interface RegistrationState {
    // Form controls.
    username?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;

    // A set of form controls which are cross with you for your previous invalid input.
    angry?: Set<string>;
}

/**
 * The registration screen. Such tedium.
 */
class RegistrationComponent extends React.Component<RegistrationProps, RegistrationState> {
    // Used to trigger the removal of the redness from the UI.
    angryTimer: any;

    constructor(props: RegistrationProps) {
        super();

        this.state = {
            username: "",
            email: "",
            password: "",
            confirmPassword: "",
            angry: new Set<string>()
        };
        
        // Listen for when we're told the credentials are wrong.
        ipcRenderer.on('registration_response', (event: any, msg: MessageTypes.RegistrationResponse) => {
            switch (msg.result) {
                case "SUCCESS":
                    // Yay, do something;
                    break;
                case "INVALID_EMAIL":
                    this.makeAngry(["email"]);
                    break;
                case "INVALID_USERNAME":
                    this.makeAngry(["username"]);
                    break;
                case "USERNAME_TAKEN":
                    this.makeAngry(["username"]);
                    break;
                case "DISPOSABLE_EMAIL":
                    this.makeAngry(["email"]);
                    break;
            }
        });
    }

    /**
     * Make the given list of fields angry, and set the timer to un-angry-ify them later.
     */
    private makeAngry(fields: string[]) {
        this.setState({angry: new Set<string>(fields)});
        this.angryTimer = setTimeout(() => {
            this.setState({angry: new Set<string>()});
        }, 1000);
    }

    // Bullshit React form textbox handling.
    handleUsernameChange(e:any) {
        this.setState({username: e.target.value});
    }
    handleEmailChange(e:any) {
        this.setState({email: e.target.value});
    }
    handlePasswordChange(e:any) {
        this.setState({password: e.target.value});
    }
    handlePasswordConfirmChange(e:any) {
        this.setState({confirmPassword: e.target.value});
    }

    handleSubmit(e:any) {
        e.preventDefault();

        // Remove any anger from the fields.
        clearTimeout(this.angryTimer);
        this.setState ({
            angry: new Set<string>()
        });

        // Send the crap to the server.
        ipcRenderer.send('send_to_server', {
            "login": this.state.username,
            "email": this.state.email,
            "password": this.state.password,
        });

        // TODO: Probably want some "loading" UI a this point...
    }

    /**
     * Switch to a different preapp screen.
     */
    changeScreen(s:PreAppStage) {
        this.props.eventSink.emit("change_screen", s)
    }

    /**
     * Return the css classnames to use for a control, accounting for possible anger.
     * @param controlName
     */
    private getClassnames(controlName:string) {
        return classNames("form-control", {"angry-form-control": this.state.angry.has(controlName)});
    }

    render() {

        return (
            <form role="form" onSubmit={(e:any) => this.handleSubmit(e)}>
                <div className="form-group">
                    <input type="text"
                           placeholder="Username"
                           pattern="^$|^[^,]{1,20}$"
                           className={this.getClassnames("username")}
                           value={this.state.username} onChange={(e:any) => this.handleUsernameChange(e)}
                    />
                </div>
                <div className="form-group">
                    <input type="email"
                           placeholder="Email"
                           pattern="^$|^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$"
                           className={this.getClassnames("email")}
                           value={this.state.email} onChange={(e:any) => this.handleEmailChange(e)}
                    />
                </div>
                <div className="form-group">
                    <input type="password"
                           placeholder="Password"
                           className={this.getClassnames("password")}
                           value={this.state.password} onChange={(e:any) => this.handlePasswordChange(e)}
                    />
                    <input type="password"
                           placeholder="Confirm Password"
                           className={this.getClassnames("password")}
                           value={this.state.confirmPassword}
                           onChange={(e:any) => this.handlePasswordConfirmChange(e)}
                    />
                </div>
                <button type="button" onClick={() => this.changeScreen(PreAppStage.LOGIN)} className="btn btn-default" id="back-btn">Back</button>
                <button type="submit" className="btn btn-default" id="register-btn">Register</button>
            </form>

        );
    }
}

export default RegistrationComponent;
