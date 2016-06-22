"use strict";
require('../styles/Hello.scss');
const React = require('react');
const Hello_tsx_1 = require('./Hello.tsx');
class AppComponent extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (React.createElement(Hello_tsx_1.default, {name: this.props.name}));
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = AppComponent;
//# sourceMappingURL=App.js.map