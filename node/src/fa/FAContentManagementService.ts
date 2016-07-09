import {Game} from "../../../browser/src/model/data/Game";
/**
 * A service for managing the maps/mods (and maybe replays?) installed. When initialised it builds
 * an index of these things, and provides methods for manipulating them.
 */
export class FAContentManagementService {
    /**
     * Make sure we have everything we need to join the given game.
     * Note: You can get the path to the "/bin" directory with Config.get("binaryPath"). You might
     * want to add more config keys for the patcher in config/index.ts::defaultConfiguration.
     */
    ensureReadyToJoin(game: Game) {
        // TODO
    }

    // TODO List of maps? Check if map exists? Other things that might be useful?
}

let instance:FAContentManagementService = new FAContentManagementService();
export default instance;
