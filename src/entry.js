"use strict";

require('./styles/base.scss');
const React = require('react');
const ReactDOM = require('react-dom');
const App_tsx_1 = require('./components/App.tsx');
ReactDOM.render(
    React.createElement("div",
        {id: "placeholder"},
        React.createElement(App_tsx_1.default, {name: "GEFAFWISP"})
    ),
    document.getElementById('content')
);
