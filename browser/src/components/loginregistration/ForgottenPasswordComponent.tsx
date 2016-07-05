import 'jquery';
import 'bootstrap';
import {ipcRenderer} from 'electron';
import * as MessageTypes from "../../../../node/src/net/MessageTypes";
import * as classNames from 'classnames';
const style: any = require('../../styles/forgottenpassword.scss');

import * as React from "react";
import {EventEmitter} from "events";
import {PreAppStage} from "./PreApp";

interface ForgottenPasswordProps {
    // An EventEmitter connected to the main UI. This may be used to change the UI to another screen
    eventSink: EventEmitter;
}

interface ForgottenPasswordState {
    // Form controls.
    email?: string;
}

/**
 * The forgotten password screen.
 */
class ForgottenPasswordComponent extends React.Component<ForgottenPasswordProps, ForgottenPasswordState> {
    constructor(props: ForgottenPasswordProps) {
        super();

        this.state = {
            email: ""
        };
    }

    // Bullshit React form textbox handling.
    handleEmailChange(e:any) {
        this.setState({email: e.target.value});
    }

    handleSubmit(e:any) {
        e.preventDefault();

        // TODO: There is nowhere to send this at the moment. Need to add an API route for it.

        return false;
    }

    /**
     * Switch to a different preapp screen.
     */
    changeScreen(s:PreAppStage) {
        this.props.eventSink.emit("change_screen", s)
    }

    render() {
        return (

<form role="form" onSubmit={(e:any) => this.handleSubmit(e)}>
    <div className="form-group">
        <input type="email"
               placeholder="Email"
               pattern="^$|^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$"
               className="form-control"
               value={this.state.email} onChange={(e:any) => this.handleEmailChange(e)}
        />
    </div>
    <button type="button" onClick={() => this.changeScreen(PreAppStage.LOGIN)} className="btn btn-default back-btn">Back</button>
    <button type="submit" id="forgotten-submit-btn" className="btn btn-default">Submit</button>
</form>

        );
    }
}

export default ForgottenPasswordComponent;
