"use strict";
require('../styles/Hello.scss');
const React = require('react');
class HelloComponent extends React.Component {
    constructor(props) {
        super(props);
    }
    _sayHello(x = '') {
        return `Hello ${x}`;
    }
    render() {
        return (React.createElement("div", {className: "HelloComponent"}, React.createElement("p", {className: "greeting"}, this._sayHello(this.props.name))));
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = HelloComponent;
