import * as React from 'react';
import {ipcRenderer} from 'electron';
import {ChatModel, Channel, ChatMessage} from "../model/ChatModel";
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import ChatChannel from "./chat/ChatChannel";
import {PlayerService} from "../model/PlayerService";
const style: any = require('../styles/chat.scss');

interface ChatProps {
    chatModel: ChatModel;
    ps: PlayerService;
}

interface ChatState {
    channels?: Channel[];
}

export class ChatTab extends React.Component<ChatProps, ChatState> {

    constructor(props: ChatProps) {
        super(props);

        this.props.chatModel.on('channel_joined', () => {
            this.setState({
                channels:this.props.chatModel.getChannels()
            });
        });


        this.props.chatModel.on('message', () => {
            console.error("ATtempt render of emssage");
            this.setState({
                channels:this.props.chatModel.getChannels()
            });
        });

        this.state = {
            channels:[]
        }
    }

    render() {
        let channels:Channel[] = this.state.channels;
        console.error("Channels: " + channels);
        return (

            
<div className="chat_tab">
    <Tabs>
        <TabList>
            {   // The list of tab names.
                channels.map((c:Channel) => <Tab key={c.name}>{c.name}</Tab>)
            }
        </TabList>
        {channels.map((c:Channel) =>
            <TabPanel key={c.name}>
                <ChatChannel channel={c} ps={this.props.ps}/>
            </TabPanel>
        )}
    </Tabs>
</div>


        );
    }
}

export default ChatTab;
