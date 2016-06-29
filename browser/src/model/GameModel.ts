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
            console.error("Got me some games!");
            for (let i:number = 0; i < msg.games.length; i++) {
                this.handleServerGame(msg.games[i]);
            }

            this.emit("dirty")
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
            // It's a new game, so add it.
            // TODO: This is a server bug: we seem to not be told about the host before we get the game.
            let g:Game = new Game(serverGame, this.playerService);
            if (g.host == undefined) {
                console.error("Dropping game because host is missing: " + g.name);
                console.error(g.state);
                return;
            }
            this.games.set(serverGame.uid, g);
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
     * @param gameType The featured mod to filter by, or null if no filtering is desired.
     */
    getGamesOfType(gameType: string): Game[] {
        // A predicate to filter the game list by.
        let filter = ((g:Game) => g.state == "open" && (gameType == null || g.featuredMod == gameType));

        let ret:Game[] = [];

        this.games.forEach((value: Game, key: number) => {
            if (!filter(value)) {
                return;
            }

            ret.push(value);
        });

        console.error("Games: " + ret.length);

        return ret;
    }

    getOpenGames(): Game[] {
        return [];
    }
}
