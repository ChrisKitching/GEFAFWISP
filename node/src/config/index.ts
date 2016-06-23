var fs = require("fs");

let CONFIG_VARIETY:string = "production";

let content:string = fs.readFileSync("./node/config/" + CONFIG_VARIETY + ".json");
export let config = JSON.parse(content);
