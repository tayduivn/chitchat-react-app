"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
var React = require("react");
var react_redux_1 = require("react-redux");
var recompose_1 = require("recompose");
var reflexbox_1 = require("reflexbox");
var ChitchatFactory_1 = require("../chitchat/chats/ChitchatFactory");
var config = function () { return ChitchatFactory_1.ChitChatFactory.getInstance().config; };
var TypingBox_1 = require("./TypingBox");
var ChatBox_1 = require("./chat/ChatBox");
var SnackbarToolBox_1 = require("./toolsbox/SnackbarToolBox");
var UploadingDialog_1 = require("./UploadingDialog");
var GridListSimple_1 = require("../components/GridListSimple");
var StalkBridgeActions = require("../chitchat/chats/redux/stalkBridge/stalkBridgeActions");
var chatroomActions = require("../chitchat/chats/redux/chatroom/chatroomActions");
var chatroomRxEpic = require("../chitchat/chats/redux/chatroom/chatroomRxEpic");
var StickerPath_1 = require("../chitchat/consts/StickerPath");
var FileType = require("../chitchat/shared/FileType");
var chatroomMessageUtils_1 = require("../actions/chatroom/chatroomMessageUtils");
var Chat = (function (_super) {
    __extends(Chat, _super);
    function Chat() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.clientWidth = document.documentElement.clientWidth;
        _this.clientHeight = document.documentElement.clientHeight;
        _this.h_header = null;
        _this.h_subHeader = 34;
        _this.h_body = null;
        _this.h_typingArea = null;
        _this.bottom = _this.clientHeight * 0.1;
        _this.h_stickerBox = _this.clientHeight * 0.3;
        _this.fileReaderChange = function (e, results) {
            results.forEach(function (result) {
                var progressEvent = result[0], file = result[1];
                console.log(file.name, file.type);
                if (file.type && file.type.length > 0) {
                    _this.props.dispatch(chatroomRxEpic.uploadFile(progressEvent, file));
                }
                else {
                    _this.props.onError("Fail to upload file");
                }
            });
        };
        return _this;
    }
    Chat.prototype.componentWillMount = function () {
        this.state = {
            messages: new Array(),
            typingText: "",
            isLoadingEarlierMessages: false,
            earlyMessageReady: false,
            openButtomMenu: false,
            onAlert: false
        };
        this.onSubmitTextChat = this.onSubmitTextChat.bind(this);
        this.onTypingTextChange = this.onTypingTextChange.bind(this);
        this.onSubmitStickerChat = this.onSubmitStickerChat.bind(this);
        this.roomInitialize = this.roomInitialize.bind(this);
        this.onToggleSticker = this.onToggleSticker.bind(this);
        this.fileReaderChange = this.fileReaderChange.bind(this);
        var _a = this.props, chatroomReducer = _a.chatroomReducer, userReducer = _a.userReducer, params = _a.match.params;
        if (!chatroomReducer.room) {
            this.props.dispatch(chatroomActions.getPersistendChatroom(params.room_id));
        }
        else {
            this.roomInitialize(this.props);
        }
    };
    Chat.prototype.componentWillUnmount = function () {
        this.props.dispatch(chatroomActions.leaveRoomAction());
    };
    Chat.prototype.componentWillReceiveProps = function (nextProps) {
        var _this = this;
        var chatroomReducer = nextProps.chatroomReducer, stalkReducer = nextProps.stalkReducer;
        var warning_bar = document.getElementById("warning_bar");
        var typing_box = document.getElementById("typing_box");
        this.h_subHeader = (stalkReducer.state === StalkBridgeActions.STALK_CONNECTION_PROBLEM) ? 34 : 0;
        this.h_body = (this.clientHeight - (this.h_header + this.h_subHeader + this.h_typingArea));
        switch (stalkReducer.state) {
            case StalkBridgeActions.STALK_CONNECTION_PROBLEM:
                this.props.dispatch(chatroomActions.disableChatRoom());
                break;
            case StalkBridgeActions.STALK_ON_SOCKET_RECONNECT:
                this.props.history.replace("/");
                break;
            default:
                break;
        }
        switch (chatroomReducer.state) {
            case chatroomActions.JOIN_ROOM_FAILURE: {
                this.props.dispatch(chatroomRxEpic.getPersistendMessage(chatroomReducer.room._id));
                break;
            }
            case chatroomActions.JOIN_ROOM_SUCCESS: {
                this.props.dispatch(chatroomRxEpic.getPersistendMessage(chatroomReducer.room._id));
                break;
            }
            case chatroomActions.GET_PERSISTEND_CHATROOM_SUCCESS: {
                if (!recompose_1.shallowEqual(chatroomReducer.room, this.props.chatroomReducer.room))
                    this.roomInitialize(nextProps);
                break;
            }
            case chatroomRxEpic.FETCH_PRIVATE_CHATROOM_SUCCESS: {
                if (!recompose_1.shallowEqual(chatroomReducer.room, this.props.chatroomReducer.room))
                    this.roomInitialize(nextProps);
                break;
            }
            case chatroomRxEpic.CREATE_PRIVATE_CHATROOM_SUCCESS: {
                if (!recompose_1.shallowEqual(chatroomReducer.room, this.props.chatroomReducer.room))
                    this.roomInitialize(nextProps);
                break;
            }
            case chatroomActions.GET_PERSISTEND_CHATROOM_FAILURE: {
                this.props.history.push("/");
                break;
            }
            case chatroomRxEpic.CREATE_PRIVATE_CHATROOM_FAILURE: {
                this.props.history.push("/");
                break;
            }
            case chatroomRxEpic.CHATROOM_UPLOAD_FILE_SUCCESS: {
                var responseFile = chatroomReducer.responseFile, fileInfo = chatroomReducer.fileInfo;
                if (responseFile.mimetype.match(FileType.imageType)) {
                    this.onSubmitImageChat(fileInfo, responseFile.path);
                }
                else if (responseFile.mimetype.match(FileType.videoType)) {
                    this.onSubmitVideoChat(fileInfo, responseFile.path);
                }
                else if (responseFile.mimetype.match(FileType.textType) || fileInfo.type.match(FileType.file)) {
                    this.onSubmitFile(fileInfo, responseFile);
                }
                break;
            }
            case chatroomActions.ChatRoomActionsType.SEND_MESSAGE_FAILURE: {
                // this.setMessageStatus(chatroomReducer.responseMessage.uuid, "ErrorButton");
                this.props.dispatch(chatroomActions.emptyState());
                break;
            }
            case chatroomActions.ChatRoomActionsType.SEND_MESSAGE_SUCCESS: {
                this.setMessageTemp(chatroomReducer.responseMessage);
                this.props.dispatch(chatroomActions.emptyState());
                break;
            }
            case chatroomActions.ChatRoomActionsType.ON_NEW_MESSAGE: {
                chatroomActions.getMessages().then(function (messages) {
                    _this.setState(function (previousState) { return (__assign({}, previousState, { messages: messages })); }, function () {
                        var chatBox = document.getElementById("app_body");
                        chatBox.scrollTop = chatBox.scrollHeight;
                    });
                });
                this.props.dispatch(chatroomActions.emptyState());
                break;
            }
            case chatroomRxEpic.GET_PERSISTEND_MESSAGE_SUCCESS: {
                chatroomActions.getMessages().then(function (messages) {
                    _this.setState(function (previousState) { return (__assign({}, previousState, { messages: messages })); });
                });
                this.props.dispatch(chatroomActions.checkOlderMessages());
                this.props.dispatch(chatroomActions.getNewerMessageFromNet());
                break;
            }
            case chatroomActions.GET_NEWER_MESSAGE_SUCCESS: {
                chatroomActions.getMessages().then(function (messages) {
                    _this.setState(function (previousState) { return (__assign({}, previousState, { messages: messages })); });
                });
                break;
            }
            case chatroomActions.ChatRoomActionsType.ON_EARLY_MESSAGE_READY: {
                this.setState(function (previousState) { return (__assign({}, previousState, { earlyMessageReady: chatroomReducer.earlyMessageReady })); });
                break;
            }
            case chatroomActions.LOAD_EARLY_MESSAGE_SUCCESS: {
                chatroomActions.getMessages().then(function (messages) {
                    _this.setState(function (previousState) { return (__assign({}, previousState, { isLoadingEarlierMessages: false, earlyMessageReady: false, messages: messages })); });
                });
                break;
            }
            default:
                break;
        }
    };
    Chat.prototype.onLoadEarlierMessages = function () {
        this.setState(function (previousState) { return (__assign({}, previousState, { isLoadingEarlierMessages: true })); });
        this.props.dispatch(chatroomActions.loadEarlyMessageChunk());
    };
    Chat.prototype.roomInitialize = function (props) {
        var chatroomReducer = props.chatroomReducer, userReducer = props.userReducer;
        if (!userReducer.user) {
            return this.props.dispatch(chatroomActions.leaveRoomAction());
        }
        // todo
        // - Init chatroom service.
        // - getPersistedMessage.
        // - Request join room.
        chatroomActions.initChatRoom(chatroomReducer.room);
        this.props.dispatch(chatroomActions.joinRoom(chatroomReducer.room._id, StalkBridgeActions.getSessionToken(), userReducer.user.username));
    };
    Chat.prototype.setMessageStatus = function (uniqueId, status) {
        var messages = [];
        var _messages = this.state.messages.slice();
        for (var i = 0; i < _messages.length; i++) {
            if (_messages[i].uuid == uniqueId) {
                var clone = Object.assign({}, _messages[i]);
                clone.status = status;
                messages.push(clone);
            }
            else {
                messages.push(_messages[i]);
            }
        }
        this.setState(__assign({}, this.state, { messages: messages }));
    };
    Chat.prototype.setMessageTemp = function (server_msg) {
        var _messages = this.state.messages.slice();
        _messages.forEach(function (message) {
            if (message.uuid == server_msg.uuid) {
                message.body = server_msg.body;
                message.createTime = server_msg.createTime;
                message.uuid = parseInt(server_msg._id);
                message.status = "Sent";
            }
        });
        this.setState(__assign({}, this.state, { messages: _messages }));
    };
    Chat.prototype.onTypingTextChange = function (event) {
        this.setState(__assign({}, this.state, { typingText: event.target.value }));
    };
    Chat.prototype.onSubmitTextChat = function () {
        if (this.state.typingText.length <= 0)
            return;
        var msg = {
            text: this.state.typingText
        };
        this.prepareSend(msg);
    };
    Chat.prototype.onSubmitImageChat = function (file, responseUrl) {
        var msg = {
            image: file.name,
            src: config().api.host + "/" + responseUrl
        };
        this.prepareSend(msg);
    };
    Chat.prototype.onSubmitVideoChat = function (file, responseUrl) {
        var msg = {
            video: file.name,
            src: config().api.host + "/" + responseUrl
        };
        this.prepareSend(msg);
    };
    Chat.prototype.onSubmitFile = function (file, responseFile) {
        var path = responseFile.path, mimetype = responseFile.mimetype, size = responseFile.size;
        var msg = {
            file: file.name,
            mimetype: mimetype,
            size: size,
            src: config().api.host + "/" + path
        };
        this.prepareSend(msg);
    };
    Chat.prototype.onSubmitStickerChat = function (id) {
        var msg = {
            sticker: id
        };
        this.onToggleSticker();
        this.prepareSend(msg);
    };
    Chat.prototype.prepareSend = function (msg) {
        var message = chatroomMessageUtils_1.decorateMessage(msg);
        this.send(message);
        var _messages = (!!this.state.messages) ? this.state.messages.slice() : new Array();
        _messages.push(message);
        this.setState(function (previousState) { return (__assign({}, previousState, { typingText: "", messages: _messages })); }, function () {
            var chatBox = document.getElementById("app_body");
            chatBox.scrollTop = chatBox.scrollHeight;
        });
    };
    Chat.prototype.send = function (message) {
        this.props.dispatch(chatroomActions.sendMessage(message));
    };
    Chat.prototype.onToggleSticker = function () {
        this.h_body = (this.state.openButtomMenu) ? this.h_body + this.h_stickerBox : this.h_body - this.h_stickerBox;
        this.setState(function (previousState) { return (__assign({}, previousState, { openButtomMenu: !previousState.openButtomMenu })); }, function () {
            var chatBox = document.getElementById("app_body");
            chatBox.scrollTop = chatBox.scrollHeight;
        });
    };
    Chat.prototype.render = function () {
        var _this = this;
        var _a = this.props, chatroomReducer = _a.chatroomReducer, stalkReducer = _a.stalkReducer;
        return (React.createElement("div", { style: { height: "calc(100vh - 148px)" } },
            React.createElement("div", { style: { overflowY: "scroll", height: "100%" }, id: "app_body" },
                (this.state.earlyMessageReady) ?
                    React.createElement(reflexbox_1.Flex, { align: "center", justify: "center" },
                        React.createElement("p", { onClick: function () { return _this.onLoadEarlierMessages(); } }, "Load Earlier Messages!"))
                    :
                        null,
                React.createElement(ChatBox_1.ChatBox, { styles: { overflowX: "hidden" }, value: this.state.messages, onSelected: function (message) { } }),
                (this.state.openButtomMenu) ?
                    React.createElement(GridListSimple_1["default"], { boxHeight: this.h_stickerBox, srcs: StickerPath_1.imagesPath, onSelected: this.onSubmitStickerChat })
                    : null),
            React.createElement("div", null,
                React.createElement(TypingBox_1.TypingBox, { disabled: this.props.chatroomReducer.chatDisabled, onSubmit: this.onSubmitTextChat, onValueChange: this.onTypingTextChange, value: this.state.typingText, fileReaderChange: this.fileReaderChange, onSticker: this.onToggleSticker }),
                React.createElement(UploadingDialog_1["default"], null),
                React.createElement(SnackbarToolBox_1.SnackbarToolBox, null))));
    };
    return Chat;
}(React.Component));
/**
 * ## Redux boilerplate
 */
var mapStateToProps = function (state) { return (__assign({}, state)); };
exports.ChatPage = react_redux_1.connect(mapStateToProps)(Chat);
