import {ServerGame} from "../../../../node/src/net/MessageTypes";
import {PlayerService} from "../PlayerService";
import {Player} from "./Player";

/**
 * Represents the visibility states of a game. PUBLIC is visible to everyone, FRIENDS is visible to
 * friends only.
 * This may be used to hint that you are seeing a specific game for some interesting reason.
 *
 * A string-based enum is used so we can directly use the values sent from the server.
 */
type Visibility = "public" | "friends";
function isVisibility(s:string): s is Visibility {
    return s == "public" || s == "friends";
}

type GameState =
    // A game that has yet to start and is joinable.
    "open" |

    // A game that has started and is currently producing explosions.
    "playing" |

    // A game that is not presently joinable, for reasons of being in the middle of its
    // initialisation or having finished.
    // We ignore games in this state.
    "closed";
function isGameState(s:string): s is GameState {
    return s == "open" || s == "playing" || s == "closed";
}

/**
 * Represents a game, can be constructed from a game_info object.
 */
export class Game {
    visibility: Visibility;

    // True iff the game is password protected.
    hasPassword: boolean;

    id: number;
    name: string;

    state: GameState;

    // The name of the featured mod used for this game.
    featuredMod: string;

    // The ZePatcher version information for every file used by this game.
    // Yes. Really.
    // The keys are the ids of the files, the values are their ZePatcher version number.
    featured_mod_versions: Map<number, number>;

    // Any other sim mods that are enabled. Keys are mod UID, values are mod pretty name for display.
    simMods: Map<string, string>;

    // The name/path of the map.
    mapName: string;
    mapPath: string;

    // The host player
    host: Player;

    // Number of players in and capacity of the game.
    numPlayers: number;
    maxPlayers: number;

    // Which player IDs are in which teams.
    teams: Map<number, number[]>;

    /**
     * Create a Game from a server-provided game_info message. Mapping from server madness to
     * something reasonable can happen in here.
     *
     * @param gameInfo A game_info message from the server.
     * @param ps The player service, used only while the server dumbly sends us names.
     */
    constructor(gameInfo:ServerGame, ps: PlayerService) {
        this.update(gameInfo, ps);
    }

    /**
     * Update to match the given ServerGame.
     */
    update(gameInfo:ServerGame, ps:PlayerService) {
        if (isVisibility(gameInfo.visibility)) {
            this.visibility = <Visibility> gameInfo.visibility;
        } else {
            console.error("Protocol violation with visibiliy: " + gameInfo.visibility);
            // TODO: Halt and catch fire.
        }

        if (isGameState(gameInfo.state)) {
            this.state = <GameState> gameInfo.state;
        } else {
            console.error("Protocol violation with state: " + gameInfo.state);
            // TODO: Halt and catch fire.
        }

        this.hasPassword = gameInfo.password_protected;
        this.id = gameInfo.uid;
        this.name = gameInfo.title;
        this.featuredMod = gameInfo.featured_mod;
        this.featured_mod_versions = gameInfo.featured_mod_versions;
        this.simMods = gameInfo.sim_mods;
        this.mapName = gameInfo.mapname;
        this.mapPath = gameInfo.map_file_path;
        this.host = ps.byName(gameInfo.host);
        this.teams = this.desugarTeams(gameInfo.teams, ps);
    }

    /**
     * Makes the team format the server sends less stupid. We map team 1 (the FFA team) into a pile
     * of single-user teams, and we map player names to player IDs.
     *
     * @param serverTeams A server-format teams map to make sensible.
     * @param ps The player service, used only while the server dumbly sends us names.
     */
    private desugarTeams(serverTeams: Map<number, string[]>, ps: PlayerService): Map<number, number[]> {
        // Convert names to IDs.
        let ret: Map<number, number[]> = new Map<number, number[]>();
        let maxTeam = 1;

        // Annoyingly enough, foreach's argument takes value, then key.
        serverTeams.forEach((players: string[], teamNum: number) => {
            ret.set(teamNum, players.map((playerName:string) => ps.byName(playerName).id));

            // The maximum used team ID is handy for the FFA team desugaring step.
            maxTeam = Math.max(teamNum, maxTeam);
        });

        // Desgar team 1 into a series of single-element teams.
        let newTeam = maxTeam + 1;
        let FFATeam: number[] = ret.get(1);
        ret.delete(1);

        FFATeam.forEach((playerId:number) => ret.set(newTeam++, [playerId]));

        return ret;
    }
}
