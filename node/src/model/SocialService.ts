// Stores information about friends/foes and other global social state.

let friends: Set<number>;
let foes: Set<number>;

/**
 * Tell the player service about the player object representing the logged-in user (sent from the
 * server).
 *
 * @param aFriends: A set of player IDs who are your friends.
 * @param aFoes: A set of player IDs who are your foes.
 */
export function initialise(aFriends: Set<number>, aFoes: Set<number>) {
    friends = aFriends;
    foes = aFoes;
}

export function isFriend(id: number) {
    return friends.has(id);
}

export function isFoe(id: number) {
    return foes.has(id);
}
