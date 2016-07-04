import * as React from 'react';
import {MapsModel, FAFMap} from "../model/MapsModel";
import MapListElement from "./maps/MapListElement";
const style: any = require('../styles/maps.scss');

interface MapTabProps {
    mapsModel: MapsModel;
}

interface MapTabState {
    // The maps currently shown in the display.
    shownMaps?: FAFMap[];

    // Which page of the map list is currently displayed, if we are showing the map list. If we're showing search results
    // this is irrelevant.
    pageNumber?: number;
}

let PAGE_SIZE = 32;

class MapTab extends React.Component<MapTabProps, MapTabState> {
    constructor(props: MapTabProps) {
        super(props);

        this.state = {
            shownMaps: [],
            pageNumber: 1
        };

        this.props.mapsModel.on('map_list', (maps:FAFMap[]) => {
            console.error("Got maps!");
            console.error(JSON.stringify(maps));
            this.setState({shownMaps: maps})
        });

        // TODO: Defer until tab is selected!
        this.props.mapsModel.loadMapList(this.state.pageNumber, PAGE_SIZE);
    }

    render() {
        return (

<div className="map_tab">
    <h3>Maps</h3>

    <div className="map_list">
        {this.state.shownMaps
            .map(function(listValue:FAFMap) {
                    return <MapListElement key={listValue.id} map={listValue}/>;
                }
            )}
    </div>
</div>

        );
    }
}

export default MapTab;
