import "../styles/Hello.scss";
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import * as React from "react";
import ChatComponent from "./Chat.tsx";

interface AppProps {
  name: string
}

class AppComponent extends React.Component<AppProps, {}> {
  constructor(props: AppProps) {
    super(props);
  }
  handleSelect(index: number, last: number) {
    console.log(`Switching to tab ${index} from ${last}`);
  }
  render() {
    return (
        <Tabs onSelect={this.handleSelect}>
          <TabList>
            <Tab>What's new</Tab>
            <Tab>Chat Lobby</Tab>
            <Tab>Coop Missions</Tab>
            <Tab>Find Games</Tab>
            <Tab>Leaderboards</Tab>
            <Tab>Replays</Tab>
            <Tab>Vaults</Tab>
          </TabList>
            <TabPanel>
              <iframe frameBorder="" height="100%" id='whats_new_iframe' src="http://www.faforever.com/news/"></iframe>
            </TabPanel>
            <TabPanel>
              <ChatComponent></ChatComponent>
            </TabPanel>
            <TabPanel></TabPanel>
            <TabPanel></TabPanel>
            <TabPanel></TabPanel>
            <TabPanel></TabPanel>
            <TabPanel></TabPanel>
        </Tabs>
    );
  }
}

export default AppComponent;
