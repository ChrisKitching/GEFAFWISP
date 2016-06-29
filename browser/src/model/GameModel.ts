import {EventEmitter} from "events";
import {ipcRenderer} from 'electron';
import * as MessageTypes from "../../../node/src/net/MessageTypes";
import {Game} from "./data/Game";
import {ServerGame} from "../../../node/src/net/MessageTypes";
import {PlayerService} from "./PlayerService";

/**
 * The sort options provided by the UI.
 */
enum SortKey {
    PLAYER_COUNT,
    GAME_QUALITY,
    AVERAGE_RATING
}

/**
 * A module to hold state about all known open or playing games.
 *
 * Games in the closed state are not stored: that state is only really used a notification of delete.
 */
export class GameModel extends EventEmitter {
    // A map from game id to game info.
    private games: Map<number, Game>;
    private playerService:PlayerService;

    constructor(ps: PlayerService) {
        super();

        // Only necessary as long as the server is sending us usernames not IDs.
        // TODO: Fix the server, decouple this shit.
        this.playerService = ps;
        this.games = new Map<number, Game>();

        // Listen to game_info messages from the server.
        ipcRenderer.on('game_info', (event:any, msg: MessageTypes.GameInfo) => {
            msg.games.forEach((game: ServerGame) => this.handleServerGame(game));

            this.emit("invalidate")
        });
    }

    private handleServerGame(serverGame: ServerGame) {
        // Is this a game deletion?
        // TODO: Message type for this would be tidier...
        if (serverGame.state == "closed") {
            if (this.games.has(serverGame.uid)) {
                this.games.delete(serverGame.uid);
            }

            return;
        }

        // If this is an update, merge the objects.
        if (serverGame.uid in this.games) {
            this.games.get(serverGame.uid).update(serverGame, this.playerService);
        } else {
            // It's a new game, so add that.
            this.games.set(serverGame.uid, new Game(serverGame, this.playerService));
        }
    }

    /**
     * Sort the games according to the given sort key.
     * @param key
     */
    sort(key: SortKey) {

    }

    /**
     * Get all games of the given type (featured mod).
     * @param gameType
     */
    getGamesOfType(gameType: string) {
    }

    getOpenGames(): Game[] {
        return [];
    }
}
