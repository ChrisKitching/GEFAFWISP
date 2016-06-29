/**
 * Module for providing configuration, both package configuration and user-configuration.
 * Only the latter is written to the user's appdata directory. The former is shipped with the app
 * and can be considered static. The API for reading settings doesn't distinguish between the two,
 * and all writes are implicitly to the user config.
 */


var fs = require("fs");
let Conf:any = require("user-appdata");

// Obtain the application name in the most amusing way possible.
let appName:string = require('../../../package.json').name;

// The flavour of package configuration to load.
let CONFIG_VARIETY:string = "production";

// Load package config.
let content:string = fs.readFileSync("./node/config/" + CONFIG_VARIETY + ".json");
export let pkgconfig = JSON.parse(content);

interface FAFConfig {
    // User config.
    savedUsername?: string;
    savedPassword?: string;

    // TODO: Moar!
}

// The default configuration used when the config file is absent or broken.
let defaultConfiguration:FAFConfig = {
};

export class Config {
    /**
     * Keys:
     *
     * savedUsername?: string;
     * savedPassword?: string;
     */
    static configuration: Map<string, any>;

    static load() {
        // Load user config. This is almost completey untyped, alas.
        Config.configuration = new Map<string, any>();
        let config:any = new Conf({appname : appName, defaultSettings : defaultConfiguration});
        for (var key in config.settings) {
            Config.configuration.set(key, config.settings[key]);
        }
    }

    static get(key:string) {
        return Config.configuration.get(key);
    }
}
