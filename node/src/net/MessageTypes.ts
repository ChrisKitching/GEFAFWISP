// Interfaces for all message types we send to the FAF server.


import {Rating, Player} from "../../../browser/src/model/data/Player";
/**
 * Base interface for all messages we send to the server.
 */
export interface OutboundMessage {
    // The type of the message.
    command:string;
}

export interface AskSession extends OutboundMessage {
    command:"ask_session";

    // A string identifying the version of the client.
    version:string;

    // A string identifying the client.
    user_agent:string;
}

export interface Login extends OutboundMessage {
    command:"hello";

    // The name of the user logging in.
    login:string;

    // sha256 of the user's password.
    password:string;

    // The uid generated by the uid binary.
    unique_id:string;
}

/**
 * Used to remove a friend or foe. Set either the friend or foe field. If both are set, the behaviour
 * of the server is undefined.
 */
export interface SocialRemove extends OutboundMessage {
    command: "social_remove";

    friend?: number;
    foe?: number;
}

/**
 * Used to add a friend or foe. Set either the friend or foe field. If both are set, the behaviour
 * of the server is undefined.
 */
export interface SocialAdd extends OutboundMessage {
    command: "social_add";

    friend?: number;
    foe?: number;
}

/**
 * Administrative actions. If the logged in user does not have the correct authority, bad things
 * will occur.
 */
export interface Admin extends OutboundMessage {
    command: "admin";

    // The action to take. Which other fields are necessary depends on the action.
    //
    // Currently supported actions:
    // closelobby: Terminate a player's FAF client.
    // closeFA: Terminate a player's FA game.
    // requestavatars: TODO
    // add_avatar:
    // remove_avatar:
    // requestavatars
    // join_channel:
    //
    action: string;

    // The user to apply a user-specific action to.
    user_id?: number;

    // ... Multiple users...
    user_ids?: number[];

    // For join_channel, the name of the channel to join.
    channel?: string;

    // The avatar to apply an action to, if applicable.
    avatar_id?: number;
}

/**
 * Get the list of avatars available to this user.
 */
export interface ListAvatar extends OutboundMessage {
    command: "list_avatar";
}

/**
 * Set the user's avatar to a specific one.
 */
export interface SelectAvatar extends OutboundMessage {
    command: "select_avatar";

    // URL of the avatar to select.
    avatar: string;
}

/**
 * Request to join a custom game.
 */
export interface JoinGame extends OutboundMessage {
    command: "game_join";

    // The id of the game to join. TODO: Dat name though.
    uid: number;

    // TODO: document.
    gameport: number;

    // The password you're giving to join this game. Necessary if the game has a password, otherwise
    // ignored.
    password?: string;

    // TODO: Document.
    relay_address: string;
}

type Visibility = "friends" | "public";

/**
 * Request to host a custom game.
 */
export interface HostGame extends OutboundMessage {
    command: "game_host";

    // TODO: document.
    relay_address: string;

    // Name of the game.
    title: string;

    gameport: number;

    // Is this game visible to everyone or just friends?
    visibility: Visibility;

    // The featured mod for this game.
    mod: string;

    // The initial map for this game. TODO: Deprecated?
    mapname: string;

    // TODO: Make optional?
    password: string;
}

/**
 * Request to be added to the ladder matchmaker.
 */
export interface JoinLadder extends OutboundMessage {
    command: "game_matchmaking"; // TODO: Dat identifier.


}

/**
 * Request for the list of coop maps.
 */
export interface CoopList extends OutboundMessage {
    command: "coop_list";
}

/**
 * Create a new user account.
 */
export interface CreateAccount extends OutboundMessage {
    command: "create_account";

    // The desired username.
    login: string;
    email: string;
    password: string;
}

/**
 * Base interface for all messages we receive from the server.
 */
export interface InboundMessage {
    // The type of the message.
    command:string;
}

/**
 * Message providing your session ID. Received in response to the client sending version information
 * and passing the check (otherwise an Update message is sent, notifying the client that it is out
 * of date).
 */
export interface Session extends InboundMessage {
    command: "session";

    // This connection's unique session ID number.
    session: number;
}

/**
 * Message indicating that the client is too outdated for the server's liking.
 */
export interface Update extends InboundMessage {
    command: "update";

    // A URL to download the newest version.
    update: string;

    // The version number of the client available at the given download link.
    new_version: string;
}

/**
 * Sent when your login credentials were incorrect somehow.
 */
export interface AuthenticationFailed extends InboundMessage {
    command: "authentication_failed";

    // An error message from the server.
    text: string;
}

/**
 * Sent when authentication succeeds. The server sends you your own player info object.
 */
export interface Welcome extends InboundMessage {
    command: "welcome";

    // A Player object representing yourself.
    me: Player;
}

/**
 * Represents a url/tooltip tuple sent from the server to represent an avatar.
 */
export interface Avatar {
    url: string,
    tooltip: string
}

/**
 * What the server sends you of a player in a player_info message (oddly enough, this is not all the
 * fields of an actual player object, hence the split :/. And some of the names are silly.
 */
export interface ServerPlayer {
    id: number;
    login: string;
    global_rating: Rating;
    ladder_rating: Rating;
    number_of_games: number;
    avatar?: Avatar;
    country: string;
    clan: string;
}

/**
 * Provides information about one or more players.
 */
export interface PlayerInfo extends InboundMessage {
    command: "player_info";

    players: ServerPlayer[];
}

/**
 * Represents a featured mod notification message. A slew of these is sent on login to tell you
 * about all the featured mods (but never thereafter).
 * It would be sensible to make these all be done as one message...
 */
export interface ModInfo extends InboundMessage {
    command: "mod_info";

    // The name of the new featured mod.
    name: string;

    // Some HTML that describes the mod, for display in the UI.
    desc: string;

    // A sort key.
    order: number;

    fullname: string;
    publish: number;
}

export class ServerGame {
    // A string that maps to one of the Visibility enum values in the model.
    visibility: string;

    // True iff the game is password protected.
    password_protected: boolean;

    // The ID of the game.
    uid: number;

    // The name of the game.
    title: string;

    // A string that maps to one of the game state enum values.
    state: string;

    // The name of the featured mod used for this game.
    featured_mod: string;

    // The ZePatcher version information for every file used by this game.
    // Yes. Really.
    // The keys are the ids of the files, the values are their ZePatcher version number.
    featured_mod_versions: Object;

    // Any other sim mods that are enabled. Keys are mod UID, values are mod pretty name for display.
    sim_mods: Object;

    // The name/path of the map.
    mapname: string;
    map_file_path: string;

    // The name of the host player
    // TODO: WHY ISN'T THIS THE ID?!
    host: string;

    // Number of players in and capacity of the game.
    num_players: number;
    max_players: number;

    // Which players are in which teams.
    // Maps team number to lists of usernames TODO: USE IDS YOU PRUNE.
    // Team 1 is the FFA team. This should be desugared into separate teams, really.
    teams: Object;
}

export interface GameInfo extends InboundMessage {
    command: "game_info";

    games: ServerGame[];
}

/**
 * Slightly annoying message sent by the server to
 */
export interface Social extends InboundMessage {
    command: "social";

    // A list of IRC channels the server wants us to automatically join.
    autojoin: string[];

    // TODO: ... something?
    channels: string[];

    // Lists of user IDs for our friends/foes.
    friends: number[];
    foes: number[];
}

export interface Avatar extends InboundMessage {
    command: "avatar"
}

/**
 *
 */
export interface Stats extends InboundMessage {

}
