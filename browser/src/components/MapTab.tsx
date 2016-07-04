import * as React from 'react';
const style: any = require('../styles/maps.scss');

interface MapTabProps {
}

interface MapTabState {
}

class MapTab extends React.Component<MapTabProps, MapTabState> {
    constructor(props: MapTabProps) {
        super(props);

    }

    render() {
        return (

<div className="map_tab">
    <h3>Maps</h3>

</div>

        );
    }
}

export default MapTab;
