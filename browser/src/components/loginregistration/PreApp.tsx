import 'bootstrap';
const style: any = require('../../styles/preApp.scss');

import FindFAComponent from "./FindFAComponent"
import ForgottenPasswordComponent from "./ForgottenPasswordComponent"
import RegistrationComponent from "./RegistrationComponent"
import LoginComponent from "./LoginComponent"
import * as React from "react";
import {EventEmitter} from "events";

interface PreAppProps {}

/**
 * Enum representing the various states this UI can be in (each corresponds to a "screen").
 */
export enum PreAppStage {
    LOGIN, // The login screen.
    REGISTRATION, // The registration screen.
    FORGOTTEN_PASSWORD,
    LINK_GAME // The "Halp, we can't find the game, please tell us where it is" screen.
};

interface PreAppState {
    screenShown: PreAppStage;
}

/**
 * The top-level component that is shown during the login/registration/firstrun flow.
 *
 * All it really does is picks one of the other components in this directory and shows it, with
 * some common styling and environment (background and whatnot). All the components here are
 * really boring shitty forms of various flavours.
 */
class PreApp extends React.Component<{}, PreAppState> {
    // An EventEmitter we give to the subcomponents that they can use to induce state changes here,
    // and hence switch the UI to another screen.
    eventSource: EventEmitter;

    constructor(props: PreAppProps) {
        super();

        this.eventSource = new EventEmitter();
        this.eventSource.on("change_screen", (s:PreAppStage) => {
            this.setState({
                screenShown: s
            });
        });

        this.state = {
            screenShown: PreAppStage.LOGIN
        };
    }

    render() {
        let state:PreAppStage = this.state.screenShown;

        return (

<div className="container preApp">
    <div className="row theRow">
        <div className="col-sm-3 spacer vcenter"></div>
        <div className="col-sm-6 vcenter">
            {state == PreAppStage.LOGIN ? (
                <LoginComponent eventSink={this.eventSource}/>
            ): state == PreAppStage.REGISTRATION ? (
                <RegistrationComponent eventSink={this.eventSource}/>
            ): state == PreAppStage.FORGOTTEN_PASSWORD ? (
                <ForgottenPasswordComponent eventSink={this.eventSource}/>
            ): state == PreAppStage.LINK_GAME ? (
                <FindFAComponent eventSink={this.eventSource}/>
            ): <span className="out-of-cheese">+++ OUT OF CHEESE ERROR. REDO FROM START +++</span>}
        </div>
    </div>
</div>

        );
    }
}

export default PreApp;
