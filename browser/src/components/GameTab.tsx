import * as React from 'react';
import {ModInfo} from "../../../node/src/net/MessageTypes";
import FeaturedMod from "./FeaturedMod.tsx";
import {FeaturedModsModel} from "../model/FeaturedModsModel";
import GameComponent from "./GameComponent";
import {GameModel} from "../model/GameModel";
import {Game} from "../model/data/Game";
const style: any = require('../styles/games.scss');

interface GameTabProps {
    modModel: FeaturedModsModel;
    gameModel: GameModel;
}

interface GameTabState {
    featuredMods?: ModInfo[];

    // The list of games currently displayed.
    shownGames?: Game[];

    // The type of games to show, or null if all games should be shown.
    gameType?: string;
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

        this.props.gameModel.on("dirty", () => {
            this.setState({
                shownGames: this.props.gameModel.getGamesOfType(this.state.gameType)
            });
        });

        // Initial state.
        this.state = {
            featuredMods: this.props.modModel.getMods(),
            shownGames: this.props.gameModel.getGamesOfType(null),
            gameType: null
        }
    }

    /**
     * Called when an element of the featured mod list is clicked.
     * @param modName The name of the featured mod that was clicked.
     */
    modClicked(modName: string) {
        // Check that a nonzero amount of games will still be shown if we filter.
        let newShownGames: Game[] = this.props.gameModel.getGamesOfType(modName);
        if (newShownGames.length == 0) {
            this.setState({
                gameType: null
            });
            return;
        }

        this.setState({
            shownGames: newShownGames,
            gameType: modName
        })
    }

    render() {
        return (

<div className="game_tab">
    {/* The left-hand column with the featured mod list */}
    <div className="sidebar">
        <h5>1 vs 1 Automatch</h5>

        {/* Ladder join buttons. */}
        <div className="btn-group" id="ladder_btns" data-toggle="buttons">
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

        <h5>Create Custom Game</h5>

        {/* Featured mod list. */}
        <div className="list-group">
            {this.state.featuredMods
                // Not all mods are to be shown in the UI...
                .filter((mod) => mod.publish == 1)
                .map((listValue: ModInfo) => {
                    let className = "list-group-item";
                    if(this.state.gameType == listValue.name) {
                        className += " active";
                    }
                    return (
                        <a href="#" key={listValue.name}
                           className={className}
                           onClick={() => this.modClicked(listValue.name)}>
                            <FeaturedMod count={this.props.gameModel.getNumOpenGamesOfType(listValue.name)}
                                         mod={listValue} />
                        </a>
                    );
                }
            )}
        </div>
    </div>

    {/* The game list and suchlike. */}
    <div className="game_list">
        {this.state.shownGames
            .map(function(listValue:Game) {
                    return <GameComponent key={listValue.id} game={listValue}/>;
                }
            )}
    </div>


</div>

        );
    }
}

export default GameTab;
