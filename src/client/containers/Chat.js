var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
import * as React from "react";
/**
 * Redux + Immutable
 */
import { connect } from "react-redux";
import * as async from 'async';
import { Box, Container } from 'react-layout-components';
import Messages from 'chat-template/dist/Messages';
import { TypingBox } from './TypingBox';
import * as StalkBridgeActions from '../redux/stalkBridge/stalkBridgeActions';
import * as chatRoomActions from "../redux/chatroom/chatroomActions";
import * as chatroomRxEpic from "../redux/chatroom/chatroomRxEpic";
import { ContentType } from "../chats/models/ChatDataModels";
class IComponentNameProps {
}
;
;
// var messages = [{
//     message: 'How do I use this messaging app?',
//     from: 'right',
//     backColor: '#3d83fa',
//     textColor: "white",
//     avatar: 'https://www.seeklogo.net/wp-content/uploads/2015/09/google-plus-new-icon-logo.png',
//     duration: 2000,
//     inbound: false
// }];
class IGiftedChat {
    constructor() {
        this.backColor = '#3d83fa';
        this.textColor = "white";
    }
}
class Chat extends React.Component {
    componentWillMount() {
        console.log("Chat", this.props, this.state);
        this.onSubmitMessage = this.onSubmitMessage.bind(this);
        this.onTypingTextChange = this.onTypingTextChange.bind(this);
        this.roomInitialize = this.roomInitialize.bind(this);
        let { chatroomReducer, userReducer, params } = this.props;
        if (chatroomReducer.state == chatroomRxEpic.FETCH_PRIVATE_CHATROOM_SUCCESS) {
            this.roomInitialize(this.props);
        }
        if (!chatroomReducer.room) {
            this.props.dispatch(chatRoomActions.getPersistendChatroom(params.filter));
        }
    }
    componentDidMount() {
    }
    componentWillUnmount() {
        console.log("Chat: leaveRoom");
        this.props.dispatch(chatRoomActions.leaveRoom());
    }
    componentWillReceiveProps(nextProps) {
        let { chatroomReducer } = nextProps;
        switch (chatroomReducer.state) {
            case chatRoomActions.ChatRoomActionsType.SELECT_CHAT_ROOM: {
                this.roomInitialize(nextProps);
                break;
            }
            case chatRoomActions.ChatRoomActionsType.SEND_MESSAGE_FAILURE: {
                this.setMessageStatus(chatroomReducer.responseMessage.uuid, 'ErrorButton');
                this.props.dispatch(chatRoomActions.stop());
                break;
            }
            case chatRoomActions.ChatRoomActionsType.SEND_MESSAGE_SUCCESS: {
                this.setMessageTemp(chatroomReducer.responseMessage);
                this.props.dispatch(chatRoomActions.stop());
                break;
            }
            case chatRoomActions.ChatRoomActionsType.ON_NEW_MESSAGE: {
                this.onReceive(chatroomReducer.newMessage);
                break;
            }
            case chatRoomActions.ChatRoomActionsType.GET_PERSISTEND_MESSAGE_SUCCESS: {
                this.setInitMessages(chatRoomActions.getMessages());
                this.props.dispatch(chatRoomActions.checkOlderMessages());
                this.props.dispatch(chatRoomActions.getNewerMessageFromNet());
                break;
            }
            case chatRoomActions.ChatRoomActionsType.GET_NEWER_MESSAGE_SUCCESS: {
                this.setInitMessages(chatRoomActions.getMessages());
                break;
            }
            case chatRoomActions.ChatRoomActionsType.ON_EARLY_MESSAGE_READY: {
                this.setState({ earlyMessageReady: chatroomReducer.earlyMessageReady });
                break;
            }
            case chatRoomActions.ChatRoomActionsType.LOAD_EARLY_MESSAGE_SUCCESS: {
                this.setState({
                    isLoadingEarlierMessages: false,
                    earlyMessageReady: false
                });
                this.setInitMessages(chatRoomActions.getMessages());
                break;
            }
            default:
                break;
        }
    }
    roomInitialize(props) {
        let { chatroomReducer, userReducer, params } = props;
        //@ todo
        // - Init chatroom service.
        // - getPersistedMessage.
        // - Request join room.
        chatRoomActions.initChatRoom(chatroomReducer.room);
        this.props.dispatch(chatroomRxEpic.getPersistendMessage(chatroomReducer.room._id));
        this.props.dispatch(chatRoomActions.joinRoom(chatroomReducer.room._id, StalkBridgeActions.getSessionToken(), userReducer.user.username));
    }
    onReceive(message) {
        let _message = new IGiftedChat();
        _message = __assign({}, message);
        console.log("onReceive: ", _message);
        StalkBridgeActions.getUserInfo(message.sender, (result) => {
            _message.inbound = true;
            // _message.backColor = 
            if (message.type == ContentType[ContentType.Text])
                _message.message = message.body;
            else if (message.type == ContentType[ContentType.Image])
                message.image = message.body;
            else if (message.type == ContentType[ContentType.Location])
                message.location = message.body;
            if (result) {
                message.user = {
                    _id: result._id,
                    name: result.displayname,
                    avatar: result.image
                };
                this.setState((previousState) => {
                    return __assign({ messages: previousState.messages }, previousState);
                });
            }
            else {
                let _temp = this.state.messages.slice();
                _temp.push(_message);
                this.setState((previousState) => {
                    return __assign({}, previousState, { messages: _temp });
                });
            }
        });
    }
    setMessageStatus(uniqueId, status) {
        let messages = [];
        let _messages = this.state.messages.slice();
        for (let i = 0; i < _messages.length; i++) {
            if (_messages[i].uuid === uniqueId) {
                let clone = Object.assign({}, _messages[i]);
                clone.status = status;
                messages.push(clone);
            }
            else {
                messages.push(_messages[i]);
            }
        }
        this.setState(__assign({}, this.state, { messages: messages }));
    }
    setMessageTemp(server_msg) {
        console.log("server_response_msg", server_msg);
        if (!server_msg.uuid)
            return;
        let _messages = this.state.messages.slice();
        _messages.forEach((message) => {
            if (message.uuid == server_msg.uuid) {
                message.createTime = server_msg.createTime;
                message.uuid = server_msg.messageId;
                message.status = "Sent";
            }
        });
        this.setState(__assign({}, this.state, { messages: _messages }));
    }
    setInitMessages(messages) {
        async.mapSeries(messages, (message, resultCB) => {
            resultCB(null, this.setGiftMessage(message));
        }, (err, results) => {
            // append the message...
            this.setState((previousState) => { return __assign({}, previousState, { messages: results }); }, () => {
                console.log("Map completed: ", this.state.messages.length);
            });
        });
    }
    setGiftMessage(message) {
        let myProfile = this.props.userReducer.user;
        let msg = new IGiftedChat();
        msg = __assign({}, message);
        //@ Is my message.
        if (msg.sender == myProfile._id) {
            msg.inbound = false;
        }
        else {
            msg.inbound = true;
        }
        if (message.type == ContentType[ContentType.Text]) {
            msg.message = message.body;
        }
        else if (message.type == ContentType[ContentType.Image]) {
            msg.image = message.body;
        }
        else if (message.type == ContentType[ContentType.Location]) {
            msg.location = message.body;
        }
        else {
            msg.message = message.body;
        }
        return msg;
    }
    onTypingTextChange(event) {
        this.setState(__assign({}, this.state, { typingText: event.target.value }));
    }
    onSubmitMessage() {
        if (this.state.typingText.length <= 0)
            return;
        let msg = {
            text: this.state.typingText
        };
        let message = this.prepareSendMessage(msg);
        this.sendText(message);
        let _messages = this.state.messages.slice();
        let gift = this.setGiftMessage(message, null);
        gift.status = 'Sending...';
        _messages.push(gift);
        this.setState(__assign({}, this.state, { typingText: "", messages: _messages }));
    }
    render() {
        if (!this.state)
            return null;
        return (React.createElement(Box, { column: true, flex: "1 0 auto" },
            React.createElement(Box, { flex: "1 0 auto", alignItems: "stretch" }, (this.state) ? React.createElement(Messages, { messages: this.state.messages, styles: { container: { position: '', bottom: '' } } }) : null),
            React.createElement(Container, { alignSelf: 'center', absolute: true, style: { bottom: '0%' } },
                React.createElement(TypingBox, { onSubmit: this.onSubmitMessage, onValueChange: this.onTypingTextChange, value: this.state.typingText }))));
    }
    prepareSendMessage(msg) {
        let message = {};
        if (msg.image) {
            message.type = ContentType[ContentType.Image];
        }
        else if (msg.text) {
            message.body = msg.text;
            message.type = ContentType[ContentType.Text];
        }
        else if (msg.location) {
            message.type = ContentType[ContentType.Location];
        }
        message.rid = this.props.chatroomReducer.room._id;
        message.sender = this.props.userReducer.user._id;
        message.target = "*";
        message.uuid = Math.round(Math.random() * 10000); // simulating server-side unique id generation
        return message;
    }
    sendText(message) {
        this.props.dispatch(chatRoomActions.sendMessage(message));
    }
}
/**
 * ## Redux boilerplate
 */
function mapStateToProps(state) {
    return __assign({}, state);
}
function mapDispatchToProps(dispatch) {
    return {
        dispatch
    };
}
function mergeProps(stateProps, dispatchProps, ownProps) {
    return Object.assign({}, ownProps, __assign({}, stateProps, dispatchProps));
}
export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(Chat);
