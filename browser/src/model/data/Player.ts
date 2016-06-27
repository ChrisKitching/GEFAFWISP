import {ServerPlayer} from "../../../../node/src/net/MessageTypes";
/**
 * Represents a TrueSkill rating.
 */
export interface Rating {
    rank: number;
    deviation: number;
}

export class Player {
    // The server's ID for the player.
    id: number;

    name: string;

    // The user's ratings.
    globalRating: Rating;
    ladderRating: Rating;

    // Number of games the player has played.
    numGames: number;

    // Path to the user's avatar.
    avatar: string;

    // A country code.
    country: string;

    // The name of the player's clan (eugh) TODO
    clan: string;

    /**
     * Create a Player from a ServerPlayer.
     *
     * A ServerPlayer may contain a smaller set of keys with different names: it's the json object
     * sent over the wire, used to initialise the local player object (But not necessarily providing
     * all of the state).
     */
    constructor(p:ServerPlayer) {
        this.id = p.id;
        this.name = p.login;
        this.globalRating = p.global_rating;
        this.ladderRating = p.ladder_rating;
        this.numGames = p.number_of_games;
        this.avatar = p.avatar;
        this.country = p.country;
        this.clan = p.clan;
    }
}
