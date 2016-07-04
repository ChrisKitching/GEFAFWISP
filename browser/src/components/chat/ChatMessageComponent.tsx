import * as React from 'react';
import {ChatMessage} from "../../model/ChatModel";
import {Player} from "../../model/data/Player";

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

    /**
     * Get the JSX elements needed to represent the player. The avatar, clantag, and name.
     */
    private getPlayerIdentifier():JSX.Element {
        let msg:ChatMessage = this.props.message;
        let player:Player = this.props.player;

        let avatar:JSX.Element;
        let clantag:JSX.Element;

        // Otherwise it's an IRC user, so we just show the name (as that's all we have).
        if (player != undefined) {
            // Does this user have an avatar set?
            if (player.avatar != undefined) {
                avatar = <img src={player.avatar.url} alt={player.avatar.tooltip} className="chat_avatar"/>
            }

            // Or a clan tag?
            if (player.clan != undefined) {
                clantag = <span className="chat_clantag">[{player.clan}]</span>
            }
        }

        return (
            <span className="chat_player">{avatar}{clantag}{msg.from}</span>
        )
    }

    render() {
        let msg:ChatMessage = this.props.message;
        let baseClass = "chat_msg_" + msg.type;

        let content:string = msg.content;
        let player:JSX.Element;
        if (msg.type == "normal") {
            player = this.getPlayerIdentifier();
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
