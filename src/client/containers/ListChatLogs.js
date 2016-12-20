import * as React from 'react';
import { List, ListItem } from 'material-ui/List';
import Divider from 'material-ui/Divider';
import Subheader from 'material-ui/Subheader';
import Avatar from 'material-ui/Avatar';
import { grey400, darkBlack } from 'material-ui/styles/colors';
import IconButton from 'material-ui/IconButton';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import IconMenu from 'material-ui/IconMenu';
import MenuItem from 'material-ui/MenuItem';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
const iconButtonElement = (React.createElement(IconButton, { touch: true, tooltip: "more", tooltipPosition: "bottom-left" },
    React.createElement(MoreVertIcon, { color: grey400 })));
const rightIconMenu = (React.createElement(IconMenu, { iconButtonElement: iconButtonElement },
    React.createElement(MenuItem, null, "Reply"),
    React.createElement(MenuItem, null, "Forward"),
    React.createElement(MenuItem, null, "Delete")));
const renderList = (props) => (props.value.map((log, i) => {
    return (React.createElement("div", { key: i },
        React.createElement(ListItem, { onTouchEnd: () => props.onSelected(log), onMouseUp: () => props.onSelected(log), leftAvatar: React.createElement(Avatar, { src: "images/ok-128.jpg" }), primaryText: log.roomName, secondaryText: React.createElement("p", null,
                React.createElement("span", { style: { color: darkBlack } }, log.lastMessage)), secondaryTextLines: 2 }),
        React.createElement(Divider, { inset: true })));
}));
const ListChatLogs = (props) => (React.createElement(MuiThemeProvider, null,
    React.createElement("div", null,
        React.createElement(List, null,
            React.createElement(Subheader, null, "Today"),
            (!!props.value) ? renderList(props) : null))));
export default ListChatLogs;