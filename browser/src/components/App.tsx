import 'jquery';
import 'bootstrap';

import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import {ipcRenderer} from 'electron';
import * as MessageTypes from "../../../node/src/net/MessageTypes";
import * as React from "react";
import ChatComponent from "./Chat.tsx";
import GameTab from "./GameTab.tsx";
import {FeaturedModsModel} from "../model/FeaturedModsModel";
import {PlayerService} from "../model/PlayerService";
import {GameModel} from "../model/GameModel";
import {Player} from "../model/data/Player";

interface AppProps {
    name: string
}

class AppComponent extends React.Component<AppProps, {}> {
    // Model holding the state of the set of featured mods.
    modModel: FeaturedModsModel;

    playerService: PlayerService;
    gameModel: GameModel;

    constructor(props: AppProps) {
        super(props);

        this.playerService = new PlayerService();
        this.modModel = new FeaturedModsModel();
        this.gameModel = new GameModel(this.playerService);

        // Listen for the availability of the "Me" object.
        ipcRenderer.on('welcome', (event:any, msg: MessageTypes.Welcome) => {
            this.playerService.setMe(msg.me);
        });
    }
    handleSelect(index: number, last: number) {
        console.log(`Switching to tab ${index} from ${last}`);
    }
    render() {
        return (
            <div className="app">
                <div className="titlebar">
                    <img className="logo" src="./img/app_icon.png" />
                    <h1>FA Forever</h1>
                </div>
                <Tabs onSelect={this.handleSelect}>
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
                        <ChatComponent></ChatComponent>
                    </TabPanel>
                    <TabPanel></TabPanel>
                    <TabPanel>
                        <GameTab modModel={this.modModel} gameModel={this.gameModel}/>
                    </TabPanel>
                    <TabPanel></TabPanel>
                    <TabPanel></TabPanel>
                    <TabPanel></TabPanel>
                </Tabs>
                
            </div>
        );
    }
}

export default AppComponent;
