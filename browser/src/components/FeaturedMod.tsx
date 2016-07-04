import * as React from 'react';
import {ModInfo} from "../../../node/src/net/MessageTypes";

interface FeaturedModProps {
    mod: ModInfo;
    count: number;
}

/**
 * An element in the featured mod list.
 */
class FeaturedMod extends React.Component<FeaturedModProps, {}> {
    constructor(props: FeaturedModProps) {
        super(props);
    }

    render() {
        let pillSpan:JSX.Element;
        if (this.props.count > 0) {
            pillSpan = <span className="label label-default label-pill pull-xs-right">{this.props.count}</span>
        }

        return (
            <div className="featured_mod">
                {pillSpan}
                <img width="32" height="32" src={"./img/modIcons/" + this.props.mod.name + ".png"} className="featured_mod_icon"/>
                {this.props.mod.fullname}
            </div>
        );
    }
}

export default FeaturedMod;
