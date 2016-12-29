"use strict";
const React = require("react");
const dialog_1 = require("react-toolbox/lib/dialog");
const theme_1 = require("react-toolbox/lib/ripple/theme");
const actions = (props) => [
    { label: "Cancel", onClick: props.handleToggle },
    { label: "Save", onClick: props.handleToggle }
];
exports.AlertBox = (props) => (React.createElement("div", null,
    React.createElement(dialog_1.default, { theme: theme_1.default, actions: actions(props), active: props.active, onEscKeyDown: props.handleToggle, onOverlayClick: props.handleToggle, title: 'My awesome dialog' },
        React.createElement("p", null, "Here you can add arbitrary content. Components like Pickers are using dialogs now."))));
