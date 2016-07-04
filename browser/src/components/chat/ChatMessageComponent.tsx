import * as React from 'react';
import {ChatMessage} from "../../model/ChatModel";
import {Player} from "../../model/data/Player";
import UserComponent from "./UserComponent.tsx";

interface ChatMessageProps {
    message: ChatMessage,

    // The player object associated with the sender, if any.
    player: Player
}

/**
 * Represents a single chat message
 */
class ChatMessageComponent extends React.Component<ChatMessageProps, {}> {
    constructor(props: ChatMessageProps) {
        super(props);
    }

    render() {
        let msg:ChatMessage = this.props.message;
        let baseClass = "chat_msg_" + msg.type;

        let content:string = msg.content;
        let player:JSX.Element;
        if (msg.type == "normal") {
            player = <UserComponent player={this.props.player} nick={msg.from} showFlag={false}/>
        } else if (msg.type == "action") {
            // Prepend the name to the content for "/me" messages.
            // This exempts the name from any weirdo padding that may be defined for the name span.
            content = msg.from + " " + content;
        }

        return (
            <div className={baseClass}>
                {player}
                <span className={baseClass}>{content}</span>
            </div>
        );
    }
}

export default ChatMessageComponent;
