import {EventEmitter} from "events";
import {ipcRenderer} from 'electron';
import {ModInfo, PlayerInfo, ServerPlayer} from "../../../node/src/net/MessageTypes";
import {Player} from "./data/Player";

/**
 * A module to hold state about players (including yourself)
 */
export class PlayerService extends EventEmitter {
    // Map from player ID to player.
    private players: Map<number, Player>;

    // Map from player name to player.
    // TODO: Can we do without this? Mayyybe? IRC perhaps says no?
    private playersByName: Map<string, Player>;

    private me: Player;

    constructor(aMe: Player) {
        super();
        this.me = aMe;
        this.players = new Map<number, Player>();
        this.playersByName = new Map<string, Player>();

        // Listen to server player info messages.
        ipcRenderer.on('player_info', (event, msg:PlayerInfo) => {
            for (let player:ServerPlayer of msg.players) {
                this.handlePlayerInfo(player);
            }
        });
    }

    private handlePlayerInfo(p:ServerPlayer): void {
        // Could be a new player, or an update for any subset of the fields of an existing one.
        if (this.players.has(p.id)) {
            // It's an update: merge the objects.
            for (let key in p) {
                this.players[p.id][key] = p[key];
            }
        } else {
            // A new player.
            let newPlayer:Player = new Player(p);
            this.players[p.id] = newPlayer;
            this.playersByName[p.login] = newPlayer;
        }
    }

    /**
     * Get the Player object representing the currently logged in user.
     */
    getMe(): Player {
        return this.me;
    }

    /**
     * Look up a player by name.
     * @param name
     */
    byName(name: string): Player {
        return this.playersByName[name];
    }

    /**
     * Look up a player by their server ID.
     * @param id
     */
    byId(id: number): Player {
        return this.players[id];
    }
}
