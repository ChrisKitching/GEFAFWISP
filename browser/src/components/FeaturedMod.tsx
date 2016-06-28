import * as React from 'react';
import {ModInfo} from "../../../node/src/net/MessageTypes";

interface FeaturedModProps {
    mod: ModInfo;
}

/**
 * An element in the featured mod list.
 */
class FeaturedMod extends React.Component<FeaturedModProps, {}> {
    constructor(props: FeaturedModProps) {
        super(props);
    }

    render() {
        return (
            <div>
                <img width="32" height="32" src={"./img/modIcons/" + this.props.mod.name + ".png"}/> {this.props.mod.fullname}
            </div>
        );
    }
}

export default FeaturedMod;
