import * as React from 'react';
import {Channel, ChatMessage} from "../../model/ChatModel";
import ChatMessageComponent from "./ChatMessageComponent";
import {PlayerService} from "../../model/PlayerService";
import UserComponent from "./UserComponent.tsx";


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
    <div id="chat_userlist">
        {c.users.map((u:string) =>
            <UserComponent player={this.props.ps.byName(u)} nick={u} showFlag={true}/>
        )}
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
