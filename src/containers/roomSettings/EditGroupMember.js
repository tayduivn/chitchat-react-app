"use strict";
const React = require("react");
const reflexbox_1 = require("reflexbox");
const MuiThemeProvider_1 = require("material-ui/styles/MuiThemeProvider");
const Colors = require("material-ui/styles/colors");
const RaisedButton_1 = require("material-ui/RaisedButton");
const List_1 = require("material-ui/List");
const Divider_1 = require("material-ui/Divider");
const Avatar_1 = require("material-ui/Avatar");
exports.EditGroupMember = (props) => (React.createElement(MuiThemeProvider_1.default, null,
    React.createElement(reflexbox_1.Flex, { style: { backgroundColor: Colors.indigo50 }, flexColumn: true, align: "center" },
        React.createElement(List_1.List, null,
            " ",
            (props.members && props.members.length > 0) ?
                props.members.map((item, i, arr) => {
                    return (React.createElement("div", { key: i },
                        React.createElement(List_1.ListItem, { leftAvatar: (!!item.avatar) ?
                                React.createElement(Avatar_1.default, { src: item.avatar }) :
                                (!!item.username) ?
                                    React.createElement(Avatar_1.default, null, item.username.charAt(0)) :
                                    null, primaryText: item.username, secondaryText: React.createElement("p", null,
                                React.createElement("span", { style: { color: Colors.darkBlack } }, item.email)) }),
                        React.createElement(Divider_1.default, { inset: true })));
                }) : null),
        React.createElement(Divider_1.default, { inset: true }),
        React.createElement(RaisedButton_1.default, { label: "Submit", primary: true, onClick: props.onSubmit }))));
