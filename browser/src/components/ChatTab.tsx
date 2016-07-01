import * as React from 'react';
import {ipcRenderer} from 'electron';
import {ChatModel, Channel} from "../model/ChatModel";
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';

interface ChatProps {
    chatModel: ChatModel;
}

interface ChatState {
    
}

export class ChatTab extends React.Component<ChatProps, ChatState> {

    constructor(props: ChatProps) {
        super(props);


    }

    render() {
        let channels:Channel[] = this.props.chatModel.getChannels();
        return (

            
<div className="channels">
    <Tabs>
        <TabList>
            {   // The list of tab names.
                channels.forEach((c:Channel) => <Tab>{c.name}</Tab>)
            }
        </TabList>
        {   // The tabs themselves
            channels.forEach((c:Channel) => <TabPanel>{c.name}</TabPanel>)
        }
    </Tabs>
    {channels}
</div>


        );
    }
}

export default ChatTab;
