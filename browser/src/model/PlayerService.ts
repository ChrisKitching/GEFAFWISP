import {EventEmitter} from "events";
import {ipcRenderer} from 'electron';
import {ModInfo, PlayerInfo, ServerPlayer, Social} from "../../../node/src/net/MessageTypes";
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

    // Friends and foes of the current player.
    private friends: Set<number>;
    private foes: Set<number>;

    constructor() {
        super();
        this.friends = new Set<number>();
        this.foes = new Set<number>();
        this.players = new Map<number, Player>();
        this.playersByName = new Map<string, Player>();

        // Listen to server player info messages.
        ipcRenderer.on('player_info', (event: any, msg:PlayerInfo) => {
            for (let player of msg.players) {
                this.handlePlayerInfo(player);
            }
        });

        // Listen to social messages to update the friend/foe lists. This only happens once. Once
        // we're up and running, mutation does not lead to a new message, we have to do that
        // ourselves.
        ipcRenderer.on('social', (event: any, msg:Social) => {
            msg.friends.forEach((id: number) => this.friends.add(id));
            msg.foes.forEach((id: number) => this.foes.add(id));
        });
    }

    setMe(aMe:Player) {
        this.me = aMe;
    }

    private handlePlayerInfo(p:ServerPlayer): void {
        // Could be a new player, or an update for any subset of the fields of an existing one.
        if (this.players.has(p.id)) {
            // It's an update: merge the objects.
            this.players.get(p.id).update(p);
        } else {
            // A new player.
            let newPlayer:Player = new Player(p);
            this.players.set(p.id, newPlayer);
            this.playersByName.set(p.login, newPlayer);
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
        return this.playersByName.get(name);
    }

    /**
     * Look up a player by their server ID.
     * @param id
     */
    byId(id: number): Player {
        return this.players.get(id);
    }

    isFriend(id: number) {
        return this.friends.has(id);
    }

    isFoe(id: number) {
        return this.foes.has(id);
    }

}
