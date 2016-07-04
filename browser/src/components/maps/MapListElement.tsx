import * as React from 'react';
import {FAFMap} from "../../model/MapsModel";

interface MapProps {
    map: FAFMap;
}

/**
 * Represents a single element in the map list.
 */
class MapListElement extends React.Component<MapProps, {}> {
    constructor(props: MapProps) {
        super(props);
    }

    render() {
        let imgFloat:any = {
            float: "left",
            "marginRight":"10px"
        };

        let map:FAFMap = this.props.map;
        let previewUrl:string = "http://content.faforever.com/faf/vault/map_previews/small/" + map.technical_name + ".png"

        return (
            <div className="mapComponent">
                <img style={imgFloat} src={previewUrl}/>
                <h5><b>{map.display_name}</b></h5>
                <small><b>{map.max_players}</b> players, <b>{map.size_x}x{map.size_y}</b></small><br/>
                <small>Rating: <b>{map.rating} / 5</b></small><br/>
                <small>Played <b>{map.times_played}</b> times</small>
            </div>
        );
    }
}

export default MapListElement;
