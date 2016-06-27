import {EventEmitter} from "events";
import {ipcRenderer} from 'electron';
import {ModInfo} from "../../../node/src/net/MessageTypes";

/**
 * A module to hold state about the set of featured mods.
 */
export class FeaturedModsModel extends EventEmitter {
    featuredMods: ModInfo[];

    constructor() {
        super();
        this.featuredMods = [];

        // Listen to mod info messages from the server and use them to update our internal state.
        ipcRenderer.on('mod_info', (event, data) => {
            // TODO: Does JS have a sane sorted-insert?
            this.featuredMods.push(data);

            // Keep the list of mods in the order requested by the server (which rather unhelpfully
            // declines to send them to us in that order).
            this.featuredMods.sort((x:ModInfo, y:ModInfo) => {
                if (x.order > y.order) {
                    return 1;
                } else if (x.order < y.order) {
                    return -1;
                }

                return 0;
            });

            // TODO: Incremental state updates.
            this.emit("replace", this.featuredMods);
        });
    }

    /**
     * Get the complete list of featured mods.
     */
    getMods() {
        return this.featuredMods;
    }
}
