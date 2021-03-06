import * as React from "react";
import { withRouter } from "react-router-dom";
import { DialogBoxEnhancer } from "./toolsbox/DialogBoxEnhancer";
import { ToolbarEnhancer } from "./toolsbox/ToolbarEnhancer";
import { DialogBox } from "../components/DialogBox";
import { SimpleToolbar } from "../components/SimpleToolbar";
import { ChatPage } from "./Chat";
const options = "Options";
const favorite = "Favorite";
const toolbarMenus = [options, favorite];
const listener = (props, id, value) => {
    let { chatroomReducer, history } = props;
    if (toolbarMenus[id] == options) {
        history.push(`/chatroom/settings/${chatroomReducer.room._id}`);
    }
};
const ToolbarEnhanced = ToolbarEnhancer(({ chatroomReducer, onMenuSelect, onBackPressed, history, listener }) => (<SimpleToolbar title={(chatroomReducer.room && chatroomReducer.room.name) ? chatroomReducer.room.name : "Empty"} menus={toolbarMenus} onSelectedMenuItem={onMenuSelect} onBackPressed={onBackPressed}/>));
export let ChatPageEnhanced = DialogBoxEnhancer(({ title, message, open, handleClose, onError, history, match }) => (<div>
        <ToolbarEnhanced history={history} listener={listener}/>
        <ChatPage onError={onError} history={history} match={match}/>
        <DialogBox title={title} message={message} open={open} handleClose={handleClose}/>
    </div>));
ChatPageEnhanced = withRouter(ChatPageEnhanced);
