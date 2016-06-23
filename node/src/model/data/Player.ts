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

    login: string;

    // The user's ratings.
    global_rating: Rating;
    ladder_rating: Rating;

    // Number of games the player has played.
    number_of_games: number;

    // Path to the user's avatar.
    avatar: string;

    // A country code.
    country: string;

    // The name of the player's clan (eugh) TODO
    clan: string;
}
