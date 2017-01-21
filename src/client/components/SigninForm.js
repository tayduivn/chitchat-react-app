"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
const React = require("react");
const reflexbox_1 = require("reflexbox");
const material_ui_1 = require("material-ui");
const MuiThemeProvider_1 = require("material-ui/styles/MuiThemeProvider");
const styles = {
    span: {
        padding: 2
    },
    button: {
        width: '100%'
    },
    textfield: {
        width: '100%'
    }
};
const SubmitButton = (props) => (React.createElement(material_ui_1.RaisedButton, { primary: true, label: "Sign in", onClick: props.onSubmit, style: styles.button }, " "));
exports.SigninForm = (props) => {
    return (React.createElement(MuiThemeProvider_1.default, null,
        React.createElement(reflexbox_1.Flex, { flexColumn: true, align: 'center' },
            React.createElement(reflexbox_1.Box, { justify: 'center', align: 'center', p: 2 },
                React.createElement("h3", null, "Sign-in"),
                React.createElement("p", null, "Enter your email address and password")),
            React.createElement("span", { style: styles.span }),
            React.createElement(material_ui_1.TextField, { hintText: "Type username here.", value: props.username, onChange: props.onUsername, onKeyDown: (e) => {
                    if (e.key === 'Enter')
                        props.onSubmit();
                }, style: styles.textfield }),
            React.createElement("span", { style: styles.span }),
            React.createElement(material_ui_1.TextField, { type: 'password', hintText: "Password", value: props.password, onChange: props.onPassword, onKeyDown: (e) => {
                    if (e.key === 'Enter')
                        props.onSubmit();
                }, style: styles.textfield }),
            React.createElement("span", { style: styles.span }),
            React.createElement(SubmitButton, __assign({}, props)))));
};
