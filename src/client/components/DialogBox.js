"use strict";
const React = require("react");
const MuiThemeProvider_1 = require("material-ui/styles/MuiThemeProvider");
const Dialog_1 = require("material-ui/Dialog");
const FlatButton_1 = require("material-ui/FlatButton");
const actions = (props) => [
    React.createElement(FlatButton_1.default, { label: "Cancel", primary: true, onMouseUp: props.handleClose }),
    React.createElement(FlatButton_1.default, { label: "Submit", primary: true, keyboardFocused: true, onMouseUp: props.handleClose }),
];
exports.DialogBox = (props) => {
    return (React.createElement(MuiThemeProvider_1.default, null,
        React.createElement("div", null,
            React.createElement(Dialog_1.default, { title: props.title, actions: actions(props), modal: false, open: props.open, onRequestClose: props.handleClose }, props.message))));
};
