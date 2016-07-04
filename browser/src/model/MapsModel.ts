import {EventEmitter} from "events";
var lunr = require('lunr');

/**
 * A Map object, as reported by the API (So the names are not my fault, alas).
 */
export interface FAFMap {
    id:number;

    // I'm sorry.
    technical_name: string;

    display_name: string;
    description: string;

    // Url to download the map.
    download_url: string;

    // How many times the map has been downloaded.
    downloads: string;

    // How many times the map has been played.
    times_played: number;

    // Maximum number of players that can play on the map.
    max_players: number;

    // A number between 0 and 5 indicating player ratings for this map.
    rating: number;

    // The map dimensions in map co-ordinates.
    size_x: number;
    size_y: number;
}

let MAP_API_URL:string = "https://api.test.faforever.com/maps";

/**
 * Holds state downloaded from the Map API.
 *
 * The map API is flawed and can't do searching properly itself. As a result, we download all the
 * metadata and build a local index, which we search.
 * Aim to build this class in a way that allows migration to a more normal API once available.
 */
export class MapsModel extends EventEmitter {
    private searchIndex: any; // TODO: Can't figure out how the lunr typings work...

    constructor() {
        super();

        // Define a search index on map titles and descriptions, where titles are more important.
        this.searchIndex = lunr(function() {
            this.field('title', { boost: 10 });
            this.field('description');
            this.ref('id');
        });

        // TODO: Defer this until the tab is opened...
        this.downloadIndexPage(1);
    }

    /**
     * Add a page of data from the API to the search index.
     *
     * Input nodes should look like this:
     *
     * {
     *     "attributes": {
     *         "description": "Battling through the Core Prime suburbs",
     *         "display_name": "Block Wars"
     *     },
     *     "id": "352",
     *     "type": "map"
     * }
     */
    private updateIndex(data:any) {
        data.forEach((node:any) => {
            // Will modify an existing record if there is one.
            this.searchIndex.update({
                title: node.attributes.display_name,
                description: node.attributes.description,
                id: node.id
            });
        });

        // TODO: Probably want an event here...
    }

    /**
     * Download the given page of the index (just titles and descriptions) from the map API.
     */
    private downloadIndexPage(pageNum:number) {
        let req:XMLHttpRequest = new XMLHttpRequest();
        req.onreadystatechange = () => {
            // Are we done yet?
            if (req.readyState != 4) {
                return;
            }

            if (req.status != 200) {
                // TODO: Proper error handling?
                console.error("Unexpected HTTP status code from API: " + req.status);
                return;
            }

            let response:any = JSON.parse(req.responseText);

            this.updateIndex(response.data);
            if (response.data.length > 0) {
                // There was data, so there may be another page, let's give it a go...
                this.downloadIndexPage(pageNum + 1);
            }
        };
        req.open("GET", MAP_API_URL + "?fields[map]=display_name,description&sort=-id&page[number]=" + pageNum, true);
        req.send();
    }

    /**
     * Searches the index for the given string, emitting an event later with the search results.
     * @param query
     */
    search(query:string): void {
        let results:any = this.searchIndex.search(query);

        // TODO: A get-by-ids API route is necessary.
    }

    /**
     * Get the given page of the map list, given page number and page size. Maps are sorted reverse
     * upload order.
     */
    loadMapList(pageNumber:number, pageSize:number) {
        let req:XMLHttpRequest = new XMLHttpRequest();
        req.onreadystatechange = () => {
            // Are we done yet?
            if (req.readyState != 4) {
                return;
            }

            if (req.status != 200) {
                // TODO: Proper error handling?
                console.error("Unexpected HTTP status code from API: " + req.status);
                return;
            }

            let data:any = JSON.parse(req.responseText).data;
            let response:FAFMap[] = data.map((d:any) => <FAFMap> d.attributes);
            this.emit("map_list", response);
        };

        req.open("GET", MAP_API_URL + "?fields[map]=id,display_name,technical_name,description,downloads,download_url,max_players,rating,size_x,size_y,times_played&sort=-id&page[number]=" + pageNumber + "&page[size]=" + pageSize, true);
        req.send();
    }
}
