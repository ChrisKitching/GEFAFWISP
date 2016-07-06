/**
 * Module for providing configuration, both package configuration and user-configuration.
 * Only the latter is written to the user's appdata directory. The former is shipped with the app
 * and can be considered static. The API for reading settings doesn't distinguish between the two,
 * and all writes are implicitly to the user config.
 */


var fs = require("fs");
import {app, ipcMain} from "electron";
import * as path from  "path";
import IpcMainEvent = Electron.IpcMainEvent;

// Obtain the application name in the most amusing way possible.
let appName:string = require('../../../package.json').name;

// The flavour of package configuration to load.
let CONFIG_VARIETY:string = "production";
let CONFIG_FILE_NAME:string = "config.json";

let configFilePath:string = path.join(app.getPath("userData"), CONFIG_FILE_NAME);

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
let defaultConfiguration = {
    // Path to the directory containing ForgedAlliance.exe
    // TODO: Currently we rely on the old client to have put this in the right place for us...
    binaryPath: path.join(app.getPath("appData"), "FAForever", "bin")
};

export class Config {
    /**
     * Alas, the user-appdata library lacks typings.
     *
     * Keys:
     *
     * savedUsername?: string;
     * savedPassword?: string;
     */
    static configuration: any;

    static load() {
        // Make sure the file exists.
        fs.closeSync(fs.openSync(configFilePath, 'a'));

        Config.configuration = defaultConfiguration;

        try {
            Config.configuration = JSON.parse(fs.readFileSync(configFilePath, 'utf8'));
        } catch (e) {
            // File was presumably corrupt. Truncate it and start again.
            fs.closeSync(fs.openSync(configFilePath, 'w'));
            Config.configuration = defaultConfiguration;
        }
    }

    static get(key:string) {
        return Config.configuration[key];
    }

    static put(key:string, value:any) {
        Config.configuration[key] = value;

        fs.writeFile(configFilePath, JSON.stringify(Config.configuration));
    }
}

ipcMain.on('config:get', (event: IpcMainEvent, key: string) => {
    event.returnValue = Config.get(key) || null;
});
ipcMain.on('config:put', (event: IpcMainEvent, key: string, value: any) => {
    event.returnValue = Config.put(key, value);
});
