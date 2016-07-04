import * as React from 'react';
import {Channel, ChatMessage} from "../../model/ChatModel";
import ChatMessageComponent from "./ChatMessageComponent";
import {PlayerService} from "../../model/PlayerService";


interface ChannelProps {
    channel:Channel;
    ps:PlayerService;
}

/**
 * Component representing one chat channel, its user list, and its input box.
 */
export class ChatChannel extends React.Component<ChannelProps, {}> {
    constructor(props: ChannelProps) {
        super(props);
    }

    render() {
        let c:Channel = this.props.channel;

        return (

<div className="chat_channel">
    {/* The user list */}
    <div id="userlist">
        Userlist party!
    </div>

    <div id="chat_area">
        {c.messages.map((m:ChatMessage) =>
            <ChatMessageComponent message={m} player={this.props.ps.byName(m.from)}/>
        )}
    </div>
</div>

        )
    }
}

export default ChatChannel;
