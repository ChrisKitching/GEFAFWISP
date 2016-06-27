import * as React from 'react';
import {ipcRenderer} from 'electron';
import {ModInfo} from "../../../node/src/net/MessageTypes";
import FeaturedMod from "./FeaturedMod.tsx";
import {FeaturedModsModel} from "../model/FeaturedModsService";

interface GameTabProps {
    modModel: FeaturedModsModel;
}

interface GameTabState {
    featuredMods: ModInfo[]
}

class GameTab extends React.Component<GameTabProps, GameTabState> {
    constructor(props: GameTabProps) {
        super(props);

        // Connect the featured mods list to the featured mods model (and hence the server)
        this.props.modModel.on("replace", (newMods:ModInfo[]) => {
            this.setState({
                featuredMods: newMods
            });
        });


        // Initial state.
        this.state = {
            featuredMods: this.props.modModel.getMods()
        }
    }

    render() {
        return (

<div className="games">
    <h2>Games</h2>

    <div className="row">
        {/* The left-hand column with the featured mod list */}
        <div className="col-sm-3">
            <h4>1 vs 1 Automatch</h4>

            {/* Ladder join buttons. */}
            <div className="btn-group" data-toggle="buttons">
                <label className="btn btn-default">
                    <input type="checkbox"/><img src="img/factions/uef.png"/>
                </label>
                <label className="btn btn-default">
                    <input type="checkbox"/><img src="img/factions/cybran.png"/>
                </label>
                <label className="btn btn-default">
                    <input type="checkbox"/><img src="img/factions/aeon.png"/>
                </label>
                <label className="btn btn-default">
                    <input type="checkbox"/><img src="img/factions/seraphim.png"/>
                </label>
            </div>

            <span>Select the factions you are prepared to play as, and get automatically matched to
            a player of similar skill.</span>

            <h4>Create Custom Game</h4>

            {/* Featured mod list. */}
            <ul className="list-group">
                {this.state.featuredMods
                    // Not all mods are to be shown in the UI...
                    .filter((mod) => mod.publish == 1)
                    .map(function(listValue) {
                        return <li href="#" key={listValue.name} className="list-group-item"><FeaturedMod mod={listValue}/></li>;
                    }
                )}
            </ul>
        </div>

        {/* The game list and suchlike. */}
        <div className="col-sm-9">


        </div>
    </div>


</div>

        );
    }
}

export default GameTab;
