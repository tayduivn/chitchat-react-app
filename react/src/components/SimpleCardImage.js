"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const Card_1 = require("material-ui/Card");
const SimpleCardImage = (props) => (React.createElement(Card_1.Card, null,
    React.createElement(Card_1.CardMedia, null,
        React.createElement("img", { src: props.src, width: '100%', alt: "Image preview..." }))));
exports.default = SimpleCardImage;
