import * as React from 'react';
import {Game} from "../model/data/Game";

interface GameProps {
    game: Game
}

/**
 * Represents a single element in the game list.
 */
class GameComponent extends React.Component<GameProps, {}> {
    constructor(props: GameProps) {
        super(props);
    }


    render() {
        let imgFloat:any = {
            float: "left",
            "margin-right":"10px"
        };

        let previewUrl:string = "http://content.faforever.com/faf/vault/map_previews/small/" + this.props.game.mapName + ".png"

        return (

            <div className="gameComponent">
                <img style={imgFloat} src={previewUrl}/>
                <h5><b>{this.props.game.name}</b></h5>
                <small>on map <b>{this.props.game.mapName}</b></small><br/>
                <small>with <b>{this.props.game.numPlayers} / {this.props.game.maxPlayers}</b> players</small><br/>
                <small>by <b>{this.props.game.host.name}</b></small>
            </div>
        );
    }
}

export default GameComponent;
