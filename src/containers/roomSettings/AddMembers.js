"use strict";
const React = require("react");
const reflexbox_1 = require("reflexbox");
const FontIcon_1 = require("material-ui/FontIcon");
const TextField_1 = require("material-ui/TextField");
const Subheader_1 = require("material-ui/Subheader");
const IconButton_1 = require("material-ui/IconButton");
exports.AddMembers = () => (React.createElement("div", null,
    React.createElement(Subheader_1.default, null, "Add Members"),
    React.createElement(reflexbox_1.Flex, null,
        React.createElement(TextField_1.default, { hintText: "Enter name or email address" }),
        React.createElement(IconButton_1.default, { tooltip: "Search" },
            React.createElement(FontIcon_1.default, { className: "material-icons" }, "search")))));
