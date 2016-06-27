import * as React from 'react';
import {ipcRenderer} from 'electron';

interface GameProps {
    
}

/**
 * Represents a single element in the game list.
 */
class GameComponent extends React.Component<GameProps, {}> {
    constructor(props: GameProps) {
        super(props);
        console.log("I AM A GAME COMPONENT");
    }

    render() {
        return (
            <div className="games">


            </div>
        );
    }
}

export default GameComponent;
