import * as React from 'react';
import {ipcRenderer} from 'electron';
import {Channel, ChatMessage} from "../../model/ChatModel";
import ChatMessageComponent from "./ChatMessageComponent";
import {PlayerService} from "../../model/PlayerService";
import UserComponent from "./UserComponent.tsx";


interface ChannelProps {
    channel:Channel;
    ps:PlayerService;
}

// Must be stateful, because it contains an input box.
interface ChannelState {
    inputText: string;
}

/**
 * Component representing one chat channel, its user list, and its input box.
 */
export class ChatChannel extends React.Component<ChannelProps, ChannelState> {
    constructor(props: ChannelProps) {
        super(props);

        this.state = {
            inputText: ""
        }
    }

    // Bullshit React form babysitting.
    handleTextChange(e:any) {
        this.setState({inputText: e.target.value});
    }

    sendChatMessage(e:any) {
        e.preventDefault();
        let msg:string = this.state.inputText;

        // Action or message? (TODO: We might later want a proper command parser here).
        // I have chosen to do the command parsing here rather than in Node-land so we can
        // potentially wire up the command operations to things that aren't this textbox without
        // much hassle.
        if (msg.startsWith("/me ")) {
            ipcRenderer.send("irc_action", this.props.channel.name, msg.slice(4));
        } else {
            ipcRenderer.send("irc_message", this.props.channel.name, msg);
        }

        console.error("SEND!");
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

    <form role="form" onSubmit={(e:any) => this.sendChatMessage(e)}>
        <div className="form-group">
            <input placeholder="Enter chat messages here"
                   className="form-control"
                   value={this.state.inputText} onChange={(e:any) => this.handleTextChange(e)}
            />
        </div>
    </form>
</div>

        )
    }
}

export default ChatChannel;
