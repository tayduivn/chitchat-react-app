import * as React from "react";
/**
 * Redux + Immutable
 */
import { connect } from "react-redux";
import * as async from 'async';
import { Flex, Box } from 'reflexbox';

import Config from '../configs/config';
import * as FileType from '../consts/FileType';

import { TypingBox } from './TypingBox';
import ChatBox from "./ChatBox";
import Toolbar from "../components/ToolbarSimple";
import UtilsBox from "./UtilsBox";
import UploadingDialog from './UploadingDialog';
import GridListSimple from "../components/GridListSimple";

import { IComponentProps } from "../utils/IComponentProps";
import * as StalkBridgeActions from '../redux/stalkBridge/stalkBridgeActions';
import * as chatRoomActions from "../redux/chatroom/chatroomActions";
import * as chatroomRxEpic from "../redux/chatroom/chatroomRxEpic";

import { ContentType, IMessage } from "../chats/models/ChatDataModels";
import { MessageImp } from "../chats/models/MessageImp";

import { imagesPath } from '../consts/StickerPath';

abstract class IComponentNameProps implements IComponentProps {
    location;
    params;
    router;
    dispatch;
    chatroomReducer;
    userReducer;
    chatlogReducer;
    stalkReducer;
};

interface IComponentNameState {
    messages: any[],
    isLoadingEarlierMessages,
    typingText: string,
    earlyMessageReady,
    openButtomMenu: boolean,
    h_header: number,
    h_body: number,
    h_footer: number,
    h_stickerBox: number,
    h_chatArea: number
};

class Chat extends React.Component<IComponentNameProps, IComponentNameState> {
    componentWillMount() {
        console.log("Chat", this.props, this.state);

        const clientWidth = document.documentElement.clientWidth;
        const clientHeight = document.documentElement.clientHeight;
        const head = clientHeight * 0.1;
        const body = clientHeight * 0.8;
        const bottom = clientHeight * 0.1;
        const stickersBox = clientHeight * 0.3;

        this.state = {
            messages: new Array(),
            typingText: '',
            isLoadingEarlierMessages: false,
            earlyMessageReady: false,
            openButtomMenu: false,

            h_header: head,
            h_body: body,
            h_footer: bottom,
            h_chatArea: body,
            h_stickerBox: stickersBox
        };

        this.onSubmitTextMessage = this.onSubmitTextMessage.bind(this);
        this.onTypingTextChange = this.onTypingTextChange.bind(this);
        this.roomInitialize = this.roomInitialize.bind(this);
        this.onToggleSticker = this.onToggleSticker.bind(this);

        let { chatroomReducer, userReducer, params} = this.props;

        if (chatroomReducer.state == chatroomRxEpic.FETCH_PRIVATE_CHATROOM_SUCCESS
            || chatroomReducer.state == chatroomRxEpic.CREATE_PRIVATE_CHATROOM_SUCCESS) {
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
        let { chatroomReducer} = nextProps as IComponentNameProps;

        switch (chatroomReducer.state) {
            case chatRoomActions.GET_PERSISTEND_CHATROOM_SUCCESS: {
                this.roomInitialize(nextProps);
                break;
            }
            case chatRoomActions.GET_PERSISTEND_CHATROOM_FAILURE: {
                this.props.router.push(`/`);
                break;
            }
            case chatRoomActions.LEAVE_ROOM_SUCCESS: {
                this.props.router.push('/');
                break;
            }

            case chatroomRxEpic.CHATROOM_UPLOAD_FILE_SUCCESS: {
                let {responseUrl, fileInfo} = chatroomReducer;

                if (fileInfo.type.match(FileType.imageType)) {
                    this.onSubmitImageMessage(fileInfo, responseUrl);
                }
                else if (fileInfo.type.match(FileType.videoType)) {
                    this.onSubmitVideoMessage(fileInfo, responseUrl);
                }

                break;
            }

            case chatRoomActions.ChatRoomActionsType.SEND_MESSAGE_FAILURE: {
                this.setMessageStatus(chatroomReducer.responseMessage.uuid, 'ErrorButton');
                this.props.dispatch(chatRoomActions.emptyState());
                break;
            }
            case chatRoomActions.ChatRoomActionsType.SEND_MESSAGE_SUCCESS: {
                this.setMessageTemp(chatroomReducer.responseMessage);
                this.props.dispatch(chatRoomActions.emptyState());
                break;
            }
            case chatRoomActions.ChatRoomActionsType.ON_NEW_MESSAGE: {
                chatRoomActions.getMessages().then(messages => {
                    this.setState(previousState => ({
                        ...previousState,
                        messages: messages
                    }));
                });

                this.props.dispatch(chatRoomActions.emptyState());
                break;
            }
            case chatRoomActions.ChatRoomActionsType.GET_PERSISTEND_MESSAGE_SUCCESS: {
                chatRoomActions.getMessages().then(messages => {
                    this.setState(previousState => ({
                        ...previousState,
                        messages: messages
                    }));
                });

                this.props.dispatch(chatRoomActions.checkOlderMessages());
                this.props.dispatch(chatRoomActions.getNewerMessageFromNet());

                break;
            }
            case chatRoomActions.ChatRoomActionsType.GET_NEWER_MESSAGE_SUCCESS: {
                chatRoomActions.getMessages().then(messages => {
                    this.setState(previousState => ({
                        ...previousState,
                        messages: messages
                    }));
                });
                break;
            }
            case chatRoomActions.ChatRoomActionsType.ON_EARLY_MESSAGE_READY: {
                this.setState((previousState) => ({
                    ...previousState,
                    earlyMessageReady: chatroomReducer.earlyMessageReady
                }));

                break;
            }
            case chatRoomActions.ChatRoomActionsType.LOAD_EARLY_MESSAGE_SUCCESS: {
                chatRoomActions.getMessages().then(messages => {
                    this.setState(previousState => ({
                        ...previousState,
                        isLoadingEarlierMessages: false,
                        earlyMessageReady: false,
                        messages: messages
                    }));
                });

                break;
            }
            default:
                break;
        }
    }

    onLoadEarlierMessages() {
        this.setState(previousState => ({
            ...previousState,
            isLoadingEarlierMessages: true,
        }));

        this.props.dispatch(chatRoomActions.loadEarlyMessageChunk());
    }

    roomInitialize(props: IComponentNameProps) {
        let { chatroomReducer, userReducer, params} = props;
        if (!userReducer.user) {
            return this.props.dispatch(chatRoomActions.leaveRoom());
        }

        //@ todo
        // - Init chatroom service.
        // - getPersistedMessage.
        // - Request join room.
        chatRoomActions.initChatRoom(chatroomReducer.room);
        this.props.dispatch(chatroomRxEpic.getPersistendMessage(chatroomReducer.room._id));
        this.props.dispatch(chatRoomActions.joinRoom(chatroomReducer.room._id, StalkBridgeActions.getSessionToken(), userReducer.user.username));
    }

    setMessageStatus(uniqueId, status) {
        let messages = [];
        let _messages = this.state.messages.slice();

        for (let i = 0; i < _messages.length; i++) {
            if (_messages[i].uuid === uniqueId) {
                let clone = Object.assign({}, _messages[i]);
                clone.status = status;
                messages.push(clone);
            } else {
                messages.push(_messages[i]);
            }
        }

        this.setState({ ...this.state, messages: messages });
    }

    setMessageTemp(server_msg: IMessage) {
        console.log("server_response_msg", server_msg)
        if (!server_msg.uuid) return;

        let _messages = this.state.messages.slice();
        _messages.forEach((message: MessageImp) => {
            if (message.uuid == server_msg.uuid) {
                message.createTime = server_msg.createTime;
                message.uuid = server_msg.messageId;
                message.status = "Sent";
            }
        });

        this.setState({ ...this.state, messages: _messages });
    }

    onTypingTextChange(event) {
        this.setState({ ...this.state, typingText: event.target.value });
    }

    onSubmitTextMessage() {
        if (this.state.typingText.length <= 0) return;

        let msg = {
            text: this.state.typingText
        };
        let message = this.prepareSendMessage(msg);
        this.send(message);

        let _messages = (!!this.state.messages) ? this.state.messages.slice() : new Array();
        _messages.push(message);
        this.setState(previousState => ({ ...previousState, typingText: "", messages: _messages }));
    }

    onSubmitImageMessage(file: File, responseUrl: string) {
        let msg = {
            image: file.name,
            src: `${Config.api.host}/${responseUrl}`
        };

        this.prepareSend(msg);
    }

    onSubmitVideoMessage(file: File, responseUrl: string) {
        let msg = {
            video: file.name,
            src: `${Config.api.host}/${responseUrl}`
        };

        this.prepareSend(msg);
    }

    prepareSend(msg) {
        let message = this.prepareSendMessage(msg);
        this.send(message);

        let _messages = (!!this.state.messages) ? this.state.messages.slice() : new Array();
        _messages.push(message);
        this.setState(previousState => ({ ...previousState, typingText: "", messages: _messages }));
    }

    prepareSendMessage(msg): IMessage {
        let message = new MessageImp();
        if (msg.image) {
            message.body = msg.image;
            message.src = msg.src;
            message.type = ContentType[ContentType.Image];
        } else if (msg.text) {
            message.body = msg.text;
            message.type = ContentType[ContentType.Text];
        } else if (msg.location) {
            message.type = ContentType[ContentType.Location];
        } else if (msg.video) {
            message.body = msg.video;
            message.src = msg.src;
            message.type = ContentType[ContentType.Video];
        }

        message.rid = this.props.chatroomReducer.room._id;
        message.sender = this.props.userReducer.user._id;
        message.user = {
            _id: this.props.userReducer.user._id,
            username: this.props.userReducer.user.username,
            avatar: this.props.userReducer.user.avatar
        };
        message.target = "*";
        message.uuid = Math.round(Math.random() * 10000); // simulating server-side unique id generation
        message.status = 'Sending...';

        return message;
    }

    send(message: IMessage) {
        this.props.dispatch(chatRoomActions.sendMessage(message));
    }

    fileReaderChange = (e, results) => {
        results.forEach(result => {
            const [progressEvent, file] = result;

            console.dir(file);

            this.props.dispatch(chatroomRxEpic.uploadFile(progressEvent, file));
        });
    }

    onToggleSticker() {
        this.setState(previousState => ({
            ...previousState,
            openButtomMenu: !previousState.openButtomMenu,
            h_chatArea: (previousState.openButtomMenu) ? previousState.h_body : previousState.h_body - previousState.h_stickerBox
        }));
    }

    render(): JSX.Element {
        let {chatroomReducer } = this.props;

        return (
            <div style={{ height: document.documentElement.clientHeight }}>
                <div style={{ height: this.state.h_header }}>
                    <Flex flexAuto>
                        <Toolbar title={(chatroomReducer.room && chatroomReducer.room.name) ? chatroomReducer.room.name : ""} />
                    </Flex>
                </div>
                <div style={{ height: this.state.h_body }}>
                    <Flex flexColumn={true}>
                        <div style={{ height: this.state.h_chatArea, overflowY: 'scroll' }}>
                            {
                                (this.state.earlyMessageReady) ?
                                    <Flex align='center' justify='center'>
                                        <p onClick={() => this.onLoadEarlierMessages()}>Load Earlier Messages!</p>
                                    </Flex>
                                    :
                                    null
                            }
                            <ChatBox {...this.props} value={this.state.messages} onSelected={(message: IMessage) => {

                            } } />
                        </div>
                    </Flex>
                    {
                        (this.state.openButtomMenu) ?
                            <GridListSimple boxHeight={this.state.h_stickerBox} srcs={imagesPath} onSelected={(id) => {
                                console.log("stickers :", id);
                            } } />
                            : null
                    }
                </div>
                <Flex align='center' justify='center' flexColumn={false}>
                    <div style={{ bottom: '0%', position: 'absolute' }} >
                        <TypingBox
                            onSubmit={this.onSubmitTextMessage}
                            onValueChange={this.onTypingTextChange}
                            value={this.state.typingText}
                            fileReaderChange={this.fileReaderChange}
                            onSticker={this.onToggleSticker} />
                    </div>
                </Flex>
                <UploadingDialog />
            </div>
        );
    }
}

/**
 * ## Redux boilerplate
 */
function mapStateToProps(state) {
    return {
        ...state
    };
}
export default connect(mapStateToProps)(Chat);
