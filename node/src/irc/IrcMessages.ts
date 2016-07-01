/**
 * Base class for IRC messages.
 */
export interface IrcMessage {}

export interface PrivateMessage extends IrcMessage {
    from: string;
    message: string;
}

export interface PublicMessage extends IrcMessage {
    from: string;
    message: string;

    // The list of channels the message was sent to.
    channels: string[];
}

/**
 * A /me message on IRC.
 */
export interface Action extends IrcMessage {
    from: string;
    target: string;
    action: string;
}

/**
 * The message of the day.
 */
export interface MOTD extends IrcMessage {
    message: string;
}

/**
 * You joined a channel.
 */
export interface ChannelJoined extends IrcMessage {
    channel: string;
}

/**
 * Somebody else joined a channel you are in
 */
export interface PlayerJoined extends IrcMessage {
    who: string;

    // The channel they joined.
    channel: string;
}

/**
 * You left a channel.
 */
export interface ChannelLeft extends IrcMessage {
    channel: string;
    reason: string;
}

/**
 * Somebody else left a channel you are in
 */
export interface PlayerLeft extends IrcMessage {
    who: string;
    reason: string;

    // The channel they left.
    channel: string;
}

/**
 * Somebody else left a channel you are in
 */
export interface NameChange extends IrcMessage {
    who: string;
    newName: string;

    // The channels they are in.
    channels: string[];
}
