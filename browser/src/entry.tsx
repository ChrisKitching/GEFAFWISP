import './styles/base.scss';
import {ipcRenderer} from 'electron';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import AppComponent from './components/App.tsx'
import PreApp from './components/loginregistration/PreApp.tsx'

// When the user is logged in, create the main UI. Before then, create the login UI.
// Initially we do nothing: we wait to be told what to do by Node.
// TODO: Maybe some generic "connecting to server popup" would make sense?

ipcRenderer.on('show_main_ui', (event: any) => {
    console.error("Showing main ui");
    ReactDOM.render(
        <AppComponent name="GEFAFWISP" />,
        document.getElementById('content')
    );
});

ipcRenderer.on('show_login_ui', (event: any) => {
    console.error("Showing login ui");
    ReactDOM.render(
        <PreApp/>,
        document.getElementById('content')
    );
});

// Notify node of our readiness to receive events. Can't seem to find a builtin event with the
// right semantics (guaranteeing it runs _after_ those listeners above happen).
ipcRenderer.send("browser-ready");
