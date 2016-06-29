import 'jquery';
import 'bootstrap';
import {ipcRenderer} from 'electron';
import * as MessageTypes from "../../../node/src/net/MessageTypes";
import * as classNames from 'classnames';
const style: any = require('../styles/login.scss');

import * as React from "react";

interface LoginProps {}

interface LoginState {
    // Form controls.
    username?: string;
    password?: string;
    remember?: boolean;

    angry?: boolean;
}

/**
 * The login/registration screen. Runs in its own window,
 */
class LoginComponent extends React.Component<LoginProps, LoginState> {
    // Used to trigger the removal of the redness from the UI.
    angryTimer: any;

    constructor(props: LoginProps) {
        super();

        this.state = {
            username: "",
            password: ""
        };
        
        // Listen for when we're told the credentials are wrong.
        ipcRenderer.on('authentication_failed', (event: any, msg: MessageTypes.AuthenticationFailed) => {
            console.error("Incorrect login");
            this.setState({angry: true});
            this.angryTimer = setTimeout(() => {
                this.setState({angry: false});
            }, 1000);
        });
    }

    // Bullshit React form textbox handling.
    handleUsernameChange(e:any) {
        this.setState({username: e.target.value});
    }
    handlePasswordChange(e:any) {
        this.setState({password: e.target.value});
    }
    handleRememberChange(e:any) {
        this.setState({remember: e.target.value});
    }

    handleSubmit(e:any) {
        e.preventDefault();
        clearTimeout(this.angryTimer);

        // Send the crap to the server.
        ipcRenderer.send('login', this.state.username, this.state.password, this.state.remember);
        return false;
    }

    render() {
        let classnames:string = classNames("form-control", {"angry-form-control": this.state.angry});

        return (

<div className="container loginScreen">
    <div className="row theRow">
        <div className="col-sm-3 spacer vcenter"></div>
        <div className="col-sm-6 vcenter">
            <form role="form" onSubmit={(e:any) => this.handleSubmit(e)}>
                <div className="form-group">
                    <label>Username:</label>
                    <input type="text" className={classnames} value={this.state.username} onChange={(e:any) => this.handleUsernameChange(e)}/>
                </div>
                <div className="form-group">
                    <label>Password:</label>
                    <input type="password" className={classnames} value={this.state.password} onChange={(e:any) => this.handlePasswordChange(e)}/>
                </div>
                <div className="checkbox">
                    <label><input type="checkbox" onChange={(e:any) => this.handleRememberChange(e)}/> Remember me</label>
                </div>
                <button type="submit" className="btn btn-default">Login</button>
            </form>
        </div>
    </div>
</div>

        );
    }
}

export default LoginComponent;
