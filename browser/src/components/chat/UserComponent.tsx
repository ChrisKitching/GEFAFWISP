import * as React from 'react';
import {ChatMessage} from "../../model/ChatModel";
import {Player} from "../../model/data/Player";

interface UserProps {
    // The player object associated with the sender, if any.
    player: Player,

    // If no player object is available, just use the name string (mostly used for IRC-only users).
    nick: string,

    // If true, the country flag is rendered.
    showFlag: boolean
}

/**
 * Represents a user with their clantag, avatar, and perhaps country.
 */
class UserComponent extends React.Component<UserProps, {}> {
    constructor(props: UserProps) {
        super(props);
    }

    render() {
        let player:Player = this.props.player;

        let avatar:JSX.Element;
        let clantag:JSX.Element;
        let flag:JSX.Element;

        // Otherwise it's an IRC user, so we just show the name (as that's all we have).
        if (player != undefined) {
            // Does this user have an avatar set?
            if (player.avatar != undefined) {
                avatar = <img src={player.avatar.url} alt={player.avatar.tooltip} className="player_avatar"/>
            }

            // Or a clan tag?
            if (player.clan != undefined) {
                clantag = <span className="player_clantag">[{player.clan}]</span>
            }

            // Or a country?
            if (this.props.showFlag && player.country) {
                flag = <img src={"./img/countries/" + player.country + ".png"} alt="" className="player_flag"/>
            }
        }

        return (
            <span className="player">{avatar}{flag}{clantag}{this.props.nick}</span>
        )
    }
}

export default UserComponent;
