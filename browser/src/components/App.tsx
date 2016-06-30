import 'jquery';
import 'bootstrap';

import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import * as React from "react";
import {ChatComponent, ChatProps} from "./Chat.tsx";

interface AppProps {
    name: string
}

interface AppState {
    chatState: ChatProps
}

class AppComponent extends React.Component<AppProps, AppState> {
    constructor(props: AppProps) {
        super(props);
        this.handleSelect = this.handleSelect.bind(this);
    }
    get state() {
        return {
            chatState: {
                
            } as ChatProps
        }
    }
    handleSelect(index: number, last: number) {
        console.log(`Switching to tab ${index} from ${last}`);
        this.setState({name: 'foo'} as any);
    }
    render() {
        return (
            <div className="app">
                <div className="titlebar">
                    <img className="logo" src="./img/app_icon.png" />
                    <h1>FA Forever</h1>
                </div>
                <Tabs onSelect={this.handleSelect}
                      selectedIndex={1}>
                    <TabList>
                        <Tab><img src="./img/tabIcons/news.png" />What's new</Tab>
                        <Tab><img src="./img/tabIcons/chat.png" />Chat Lobby</Tab>
                        <Tab><img src="./img/tabIcons/coop.png" />Coop Missions</Tab>
                        <Tab><img src="./img/tabIcons/games.png" />Find Games</Tab>
                        <Tab><img src="./img/tabIcons/leaderboards.png" />Leaderboards</Tab>
                        <Tab><img src="./img/tabIcons/replays.png" />Replays</Tab>
                        <Tab><img src="./img/tabIcons/mods.png" />Vaults</Tab>
                    </TabList>
                    <TabPanel>
                        <iframe frameBorder="" height="100%" id='whats_new_iframe' src="http://www.faforever.com/news/"></iframe>
                    </TabPanel>
                    <TabPanel>
                        <ChatComponent {...this.state.chatState} />
                    </TabPanel>
                    <TabPanel />
                    <TabPanel />
                    <TabPanel />
                    <TabPanel />
                    <TabPanel />
                </Tabs>
                
            </div>
        );
    }
}

export default AppComponent;
