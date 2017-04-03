"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const react_redux_1 = require("react-redux");
const Subheader_1 = require("material-ui/Subheader");
const ChatLogsActions = require("../../chats/redux/chatlogs/chatlogsActions");
const ChatLogRxActions = require("../../chats/redux/chatlogs/chatlogRxActions");
const ListChatLogs_1 = require("./ListChatLogs");
class ChatLogsBox extends React.Component {
    componentWillMount() {
        this.state = {
            search: "",
            chatsLog: null
        };
        this.removedLog = this.removedLog.bind(this);
        this.convertObjToArr = this.convertObjToArr.bind(this);
    }
    componentWillReceiveProps(nextProps) {
        let { chatlogReducer } = nextProps;
        switch (chatlogReducer.state) {
            case ChatLogsActions.STALK_GET_CHATSLOG_COMPLETE:
                this.convertObjToArr(chatlogReducer.chatsLog);
                break;
            case ChatLogsActions.STALK_UNREAD_MAP_CHANGED:
                this.convertObjToArr(chatlogReducer.chatsLog);
                break;
            case ChatLogsActions.STALK_CHATLOG_CONTACT_COMPLETE:
                this.convertObjToArr(chatlogReducer.chatsLog);
                break;
            case ChatLogsActions.STALK_CHATLOG_MAP_CHANGED:
                this.convertObjToArr(chatlogReducer.chatsLog);
                break;
            default:
                break;
        }
    }
    convertObjToArr(obj) {
        if (!obj)
            return;
        let chatsLog = obj;
        let self = this;
        let arr = Object.keys(chatsLog).filter(function (log) {
            if (!!chatsLog[log].roomName && chatsLog[log].roomName.toLowerCase().includes(self.state.search.toLowerCase()))
                return true;
            else
                return false;
        }).map(function (key) {
            return chatsLog[key];
        });
        this.setState(Object.assign({}, this.state, { chatsLog: arr }));
    }
    removedLog(log) {
        console.log("removedLog", log);
        this.props.dispatch(ChatLogRxActions.removeRoomAccess(log.id));
    }
    render() {
        return (React.createElement("div", null,
            React.createElement(Subheader_1.default, null, "Recent chats"),
            React.createElement(ListChatLogs_1.ListChatLogs, { value: this.state.chatsLog, onSelected: (data) => {
                    this.props.router.push(`/chat/${data.id}`);
                }, onRemovedLog: this.removedLog })));
    }
}
exports.ChatLogsBox = ChatLogsBox;
const mapStateToProps = (state) => ({ chatlogReducer: state.chatlogReducer });
exports.ChatLogsBoxEnhancer = react_redux_1.connect(mapStateToProps)(ChatLogsBox);