import 'jquery';
import 'bootstrap';

import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import {ipcRenderer} from 'electron';
import * as MessageTypes from "../../../node/src/net/MessageTypes";
import * as React from "react";
import ChatTab from "./ChatTab.tsx";
import GameTab from "./GameTab.tsx";
import MapTab from "./MapTab.tsx";
import {FeaturedModsModel} from "../model/FeaturedModsModel";
import {PlayerService} from "../model/PlayerService";
import {GameModel} from "../model/GameModel";
import {ChatModel} from "../model/ChatModel";
interface AppProps {
    name: string
}

class AppComponent extends React.Component<AppProps, {}> {
    // Model holding the state of the set of featured mods.
    modModel: FeaturedModsModel;

    // Currently displayed tab
    tabIndex: number = 0;

    playerService: PlayerService;
    gameModel: GameModel;
    chatModel: ChatModel;

    constructor(props: AppProps) {
        super(props);

        this.playerService = new PlayerService();
        this.modModel = new FeaturedModsModel();
        this.gameModel = new GameModel(this.playerService);
        this.chatModel = new ChatModel();

        // Synchronously get the last-used tab before we start rendering
        this.tabIndex = ipcRenderer.sendSync('config:get', 'tabLastUsed') || 0;
        // Listen for the availability of the "Me" object.
        ipcRenderer.on('welcome', (event:any, msg: MessageTypes.Welcome) => {
            this.playerService.setMe(msg.me);
        });
        this.handleSelect = this.handleSelect.bind(this);
    }
    handleSelect(tabIndex: number) {
        this.tabIndex = tabIndex;
        ipcRenderer.send('config:put', 'tabLastUsed', this.tabIndex);
    }
    render() {
        return (
            <div className="app">
                <div className="titlebar">
                    <img className="logo" src="./img/app_icon.png" />
                    <h1>FA Forever</h1>
                </div>
                <Tabs selectedIndex={this.tabIndex} onSelect={this.handleSelect}>
                    <TabList>
                        <Tab><img src="./img/tabIcons/news.svg" /> What's new</Tab>
                        <Tab><img src="./img/tabIcons/chat.svg" /> Chat Lobby</Tab>
                        <Tab><img src="./img/tabIcons/coop.svg" /> Coop Missions</Tab>
                        <Tab><img src="./img/tabIcons/games.svg" /> Find Games</Tab>
                        <Tab><img src="./img/tabIcons/leaderboards.svg" /> Leaderboards</Tab>
                        <Tab><img src="./img/tabIcons/replays.svg" /> Replays</Tab>
                        <Tab><img src="./img/tabIcons/maps.svg" /> Maps</Tab>
                        <Tab><img src="./img/tabIcons/mods.svg" /> Mods</Tab>
                    </TabList>
                    <TabPanel>
                        <iframe frameBorder="" height="100%" id='whats_new_iframe' src="http://www.faforever.com/news/"></iframe>
                    </TabPanel>
                    <TabPanel>
                        <ChatTab chatModel={this.chatModel} ps={this.playerService}/>
                    </TabPanel>
                    <TabPanel/>
                    <TabPanel>
                        <GameTab modModel={this.modModel} gameModel={this.gameModel}/>
                    </TabPanel>
                    <TabPanel />
                    <TabPanel />
                    <TabPanel>
                        <MapTab/>
                    </TabPanel>
                    <TabPanel />
                </Tabs>
                
            </div>
        );
    }
}

export default AppComponent;
