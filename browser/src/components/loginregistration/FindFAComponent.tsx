import 'jquery';
import 'bootstrap';
import {ipcRenderer} from 'electron';
import * as MessageTypes from "../../../../node/src/net/MessageTypes";
import * as classNames from 'classnames';
const style: any = require('../../styles/findfa.scss');

import * as React from "react";
import {PreAppStage} from "./PreApp";
import {EventEmitter} from "events";

interface FindFAProps {
    // An EventEmitter connected to the main UI. This may be used to change the UI to another screen
    eventSink: EventEmitter;
}

interface FindFAState {
}

/**
 * The "We couldn't work it out for ourselves, tell us where FA is installed" screen.
 */
class FindFAComponent extends React.Component<FindFAProps, FindFAState> {
    constructor(props: FindFAProps) {
        super();

        this.state = {
        };
    }

    /**
     * Switch to a different preapp screen.
     */
    changeScreen(s:PreAppStage) {
        this.props.eventSink.emit("change_screen", s)
    }

    render() {
        return (

<span>Not implemented</span>

        );
    }
}

export default FindFAComponent;
