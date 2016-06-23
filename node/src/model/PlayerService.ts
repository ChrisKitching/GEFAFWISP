import {Player} from "./data/Player";

// Stores all the player information we know about.

// Map from player ID to player.
let players: Map<number, Player> = new Map<number, Player>();

// The logged-in player.
let me: Player;


/**
 * Tell the player service about the player object representing the logged-in user (sent from the
 * server).
 *
 * @param aMe A player object representing yourself.
 */
export function initialise(aMe: Player) {
    me = aMe;
}

export function addPlayer(player: Player) {
    players[player.id] = player;
}

export function removePlayer(id: number) {
    players.delete(id);
}
