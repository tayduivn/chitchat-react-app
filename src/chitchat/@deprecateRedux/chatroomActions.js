/**
 * Copyright 2016 Ahoo Studio.co.th.
 *
 * This is pure function action for redux app.
 */
import * as R from "ramda";
import { createAction } from "redux-actions";
import { ChatEvents, HttpStatusCode } from "stalk-js";
import { BackendFactory } from "stalk-js/starter";
import InternalStore, { ChatRoomComponent, ON_MESSAGE_CHANGE, } from "stalk-simplechat";
import * as chatroomService from "../../services/chatroomService";
import * as MessageService from "../../services/MessageService";
import { SecureServiceFactory } from "../../secure/secureServiceFactory";
import * as NotificationManager from "../stalkBridge/StalkNotificationActions";
import { updateLastAccessRoom } from "../chatlogs/chatlogRxActions";
import { updateMessagesRead } from "./chatroomRxEpic";
import { MessageType } from "stalk-js/starter/models";
import { RoomType } from "stalk-simplechat/app/models/Room";
const getStore = () => InternalStore.store;
const getConfig = () => InternalStore.config;
const authReducer = () => InternalStore.authStore;
const appReducer = () => InternalStore.store;
/**
 * ChatRoomActionsType
 */
export class ChatRoomActionsType {
}
ChatRoomActionsType.REPLACE_MESSAGE = "REPLACE_MESSAGE";
ChatRoomActionsType.ON_EARLY_MESSAGE_READY = "ON_EARLY_MESSAGE_READY";
export function initChatRoom(currentRoom) {
    if (!currentRoom) {
        throw new Error("Empty roomInfo");
    }
    const roomName = currentRoom.name;
    if (!roomName && currentRoom.type === RoomType.privateChat) {
        currentRoom.members.some((v, id, arr) => {
            if (v._id !== authReducer().user._id) {
                currentRoom.name = v.username;
                return true;
            }
        });
    }
    const chatroomComp = ChatRoomComponent.createInstance(InternalStore.dataManager);
    chatroomComp.setRoomId(currentRoom._id);
    NotificationManager.unsubscribeGlobalNotifyMessageEvent();
    chatroomComp.chatroomDelegate = onChatRoomDelegate;
    chatroomComp.outsideRoomDelegete = onOutSideRoomDelegate;
}
function onChatRoomDelegate(event, data) {
    if (event === ChatEvents.ON_CHAT) {
        const messageImp = data;
        const backendFactory = BackendFactory.getInstance();
        /**
         * Todo **
         * - if message_id is mine. Do nothing...
         * - if not my message. Update who read this message. And tell anyone.
         */
        if (authReducer().user._id === messageImp.sender) {
            // dispatch(replaceMyMessage(newMsg));
            console.log("is my message");
        }
        else {
            console.log("is contact message");
            // @ Check app not run in background.
            const appState = appReducer().appState;
            console.log("AppState: ", appState); // active, background, inactive
            if (!!appState) {
                if (appState === "active") {
                    MessageService.updateMessageReader(messageImp._id, messageImp.rid)
                        .then((response) => response.json())
                        .then((value) => {
                        console.log("updateMessageReader: ", value);
                    }).catch((err) => {
                        console.warn("updateMessageReader: ", err);
                    });
                }
                else if (appState !== "active") {
                    // @ When user joined room but appState is inActive.
                    // sharedObjectService.getNotifyManager().notify(newMsg, appBackground, localNotifyService);
                    console.warn("Call local notification here...");
                }
            }
        }
    }
    else if (event === ON_MESSAGE_CHANGE) {
        getStore().dispatch(onMessageChangedAction(data));
    }
}
function onOutSideRoomDelegate(event, data) {
    if (event === ChatEvents.ON_CHAT) {
        console.log("Call notification here...", data); // active, background, inactive
        NotificationManager.notify(data);
    }
}
export const ON_MESSAGE_CHANGED = "ON_MESSAGE_CHANGED";
const onMessageChangedAction = createAction(ON_MESSAGE_CHANGED, (messages) => messages);
const onEarlyMessageReady = (data) => ({ type: ChatRoomActionsType.ON_EARLY_MESSAGE_READY, payload: data });
export function checkOlderMessages() {
    return (dispatch) => {
        const room = getStore().getState().chatroomReducer.room;
        ChatRoomComponent.getInstance().getTopEdgeMessageTime().then((res) => {
            chatroomService.getOlderMessagesCount(room._id, res.toString(), false)
                .then((response) => response.json())
                .then((result) => {
                console.log("getEarlyMessagesCount", result);
                if (result.success && result.result > 0) {
                    //               console.log("onOlderMessageReady is true ! Show load earlier message on top view.");
                    dispatch(onEarlyMessageReady(true));
                }
                else {
                    //                console.log("onOlderMessageReady is false ! Don't show load earlier message on top view.");
                    dispatch(onEarlyMessageReady(false));
                }
            }).catch((err) => {
                console.warn("getEarlyMessagesCount fail", err);
                dispatch(onEarlyMessageReady(false));
            });
        });
    };
}
export const LOAD_EARLY_MESSAGE = "LOAD_EARLY_MESSAGE";
export const LOAD_EARLY_MESSAGE_SUCCESS = "LOAD_EARLY_MESSAGE_SUCCESS";
const loadEarlyMessage = createAction(LOAD_EARLY_MESSAGE, (payload) => payload);
const loadEarlyMessage_success = (payload) => ({ type: LOAD_EARLY_MESSAGE_SUCCESS, payload });
export function loadEarlyMessageChunk(room_id) {
    return (dispatch) => {
        dispatch(loadEarlyMessage(room_id));
        const chatroom = ChatRoomComponent.getInstance();
        chatroom.getOlderMessageChunk(room_id).then((docs) => {
            dispatch(loadEarlyMessage_success(docs));
            // @check older message again.
            dispatch(checkOlderMessages());
            // # update messages read.
            if (docs.length > 0) {
                dispatch(updateMessagesRead(docs, room_id));
            }
        }).catch((err) => {
            console.warn("loadEarlyMessageChunk fail", err);
        });
    };
}
export const GET_NEWER_MESSAGE = "GET_NEWER_MESSAGE";
export const GET_NEWER_MESSAGE_FAILURE = "GET_NEWER_MESSAGE_FAILURE";
export const GET_NEWER_MESSAGE_SUCCESS = "GET_NEWER_MESSAGE_SUCCESS";
const getNewerMessage = createAction(GET_NEWER_MESSAGE);
const getNewerMessageFailure = createAction(GET_NEWER_MESSAGE_FAILURE);
const getNewerMessageSuccess = createAction(GET_NEWER_MESSAGE_SUCCESS, (messages) => messages);
export function getNewerMessageFromNet() {
    return (dispatch) => {
        dispatch(getNewerMessage());
        const chatroom = ChatRoomComponent.getInstance();
        chatroom.getNewerMessageRecord((results, roomId) => {
            dispatch(getNewerMessageSuccess(results));
            // # update messages read.
            if (results.length > 0) {
                dispatch(updateMessagesRead(results, roomId));
            }
        }).catch((err) => {
            if (err) {
                console.warn("getNewerMessageRecord fail", err);
            }
            dispatch(getNewerMessageFailure());
        });
    };
}
export async function getMessages() {
    const chatroomComp = ChatRoomComponent.getInstance();
    const messages = await chatroomComp.getMessages();
    return messages;
}
const SEND_MESSAGE_REQUEST = "SEND_MESSAGE_REQUEST";
const SEND_MESSAGE_SUCCESS = "SEND_MESSAGE_SUCCESS";
export const SEND_MESSAGE_FAILURE = "SEND_MESSAGE_FAILURE";
const send_message_request = () => ({ type: SEND_MESSAGE_REQUEST });
const send_message_success = (data) => ({ type: SEND_MESSAGE_SUCCESS, payload: data });
const send_message_failure = (error) => ({ type: SEND_MESSAGE_FAILURE, payload: error });
export function sendMessage(message) {
    return (dispatch) => {
        dispatch(send_message_request());
        if (message.type === MessageType[MessageType.Text] && InternalStore.encryption === true) {
            const secure = SecureServiceFactory.getService();
            secure.encryption(message.body).then((result) => {
                message.body = result;
                const backendFactory = BackendFactory.getInstance();
                const chatApi = backendFactory.getServer().getChatRoomAPI();
                chatApi.pushByUids({ data: message }).then((result) => {
                    if (result.code !== 200) {
                        dispatch(sendMessageResponse(result, null));
                    }
                    else {
                        dispatch(sendMessageResponse(null, result));
                    }
                }).catch((err) => {
                    dispatch(sendMessageResponse(err, null));
                });
            }).catch((err) => {
                console.error(err);
                dispatch(send_message_failure(err));
            });
        }
        else {
            const backendFactory = BackendFactory.getInstance();
            const chatApi = backendFactory.getServer().getChatRoomAPI();
            chatApi.pushByUids({ data: message }).then((result) => {
                if (result.code !== 200) {
                    dispatch(sendMessageResponse(result, null));
                }
                else {
                    dispatch(sendMessageResponse(null, result));
                }
            }).catch((err) => {
                dispatch(sendMessageResponse(err, null));
            });
        }
    };
}
function sendMessageResponse(err, res) {
    return (dispatch) => {
        console.log("sendMessageResponse!", err, res);
        if (!!err) {
            dispatch(send_message_failure(err.message));
        }
        else {
            const chatroomComp = ChatRoomComponent.getInstance();
            if (res.code === HttpStatusCode.success && res.data.hasOwnProperty("resultMsg")) {
                const _msg = { ...res.data.resultMsg };
                if (_msg.type === MessageType[MessageType.Text] && InternalStore.encryption) {
                    const secure = SecureServiceFactory.getService();
                    secure.decryption(_msg.body).then((res) => {
                        _msg.body = res;
                        chatroomComp.saveToPersisted(_msg);
                        dispatch(send_message_success(_msg));
                    }).catch((err) => {
                        _msg.body = err.toString();
                        chatroomComp.saveToPersisted(_msg);
                        dispatch(send_message_success(_msg));
                    });
                }
                else {
                    chatroomComp.saveToPersisted(_msg);
                    dispatch(send_message_success(_msg));
                }
            }
            else {
                dispatch(send_message_failure(res.message));
            }
        }
    };
}
const JOIN_ROOM_REQUEST = "JOIN_ROOM_REQUEST";
export const JOIN_ROOM_SUCCESS = "JOIN_ROOM_SUCCESS";
export const JOIN_ROOM_FAILURE = "JOIN_ROOM_FAILURE";
const joinRoom_request = () => ({ type: JOIN_ROOM_REQUEST });
const joinRoom_success = (data) => ({ type: JOIN_ROOM_SUCCESS, payload: data });
const joinRoom_failure = (error) => ({ type: JOIN_ROOM_FAILURE, payload: error });
export function joinRoom(roomId, token, username) {
    return (dispatch) => {
        dispatch(joinRoom_request());
        try {
            const backendFactory = BackendFactory.getInstance();
            const server = backendFactory.getServer();
            server.getLobby().joinRoom(token, username, roomId, (err, res) => {
                console.log("JoinChatRoomRequest value", res);
                if (err || res.code !== HttpStatusCode.success) {
                    dispatch(joinRoom_failure(err));
                }
                else {
                    dispatch(joinRoom_success());
                }
            });
        }
        catch (ex) {
            dispatch(joinRoom_failure(ex.message));
        }
    };
}
export const LEAVE_ROOM = "LEAVE_ROOM";
export const LEAVE_ROOM_SUCCESS = "LEAVE_ROOM_SUCCESS";
const leaveRoom = () => ({ type: LEAVE_ROOM });
const leaveRoomSuccess = () => ({ type: LEAVE_ROOM_SUCCESS });
export function leaveRoomAction() {
    return (dispatch) => {
        const _room = getStore().getState().chatroomReducer.get("room");
        if (!!_room) {
            const token = getStore().getState().stalkReducer.stalkToken;
            const room_id = _room._id;
            ChatRoomComponent.getInstance().dispose();
            NotificationManager.regisNotifyNewMessageEvent();
            dispatch(updateLastAccessRoom(room_id));
            dispatch(leaveRoom());
        }
        else {
            dispatch(leaveRoom());
        }
    };
}
export const DISABLE_CHATROOM = "DISABLE_CHATROOM";
export const ENABLE_CHATROOM = "ENABLE_CHATROOM";
export const disableChatRoom = () => ({ type: DISABLE_CHATROOM });
export const enableChatRoom = () => ({ type: ENABLE_CHATROOM });
export const GET_PERSISTEND_CHATROOM = "GET_PERSISTEND_CHATROOM";
const GET_PERSISTEND_CHATROOM_CANCELLED = "GET_PERSISTEND_CHATROOM_CANCELLED";
export const GET_PERSISTEND_CHATROOM_SUCCESS = "GET_PERSISTEND_CHATROOM_SUCCESS";
export const GET_PERSISTEND_CHATROOM_FAILURE = "GET_PERSISTEND_CHATROOM_FAILURE";
const getPersistChatroomFail = () => ({ type: GET_PERSISTEND_CHATROOM_FAILURE });
const getPersistChatroomSuccess = (roomInfo) => ({ type: GET_PERSISTEND_CHATROOM_SUCCESS, payload: roomInfo });
export const getPersistendChatroom = (roomId) => ((dispatch) => {
    dispatch({ type: GET_PERSISTEND_CHATROOM, payload: roomId });
    const { chatrooms } = getStore().getState().chatroomReducer;
    if (!chatrooms) {
        return dispatch(getPersistChatroomFail());
    }
    const rooms = chatrooms.filter((room, index, array) => {
        if (room._id.toString() === roomId) {
            return room;
        }
    });
    if (rooms.length > 0) {
        dispatch(getPersistChatroomSuccess(rooms[0]));
    }
    else {
        dispatch(getPersistChatroomFail());
    }
});
export const getRoom = (room_id) => {
    const { chatrooms } = getStore().getState().chatroomReducer;
    if (!chatrooms) {
        return null;
    }
    const rooms = chatrooms.filter((room, index, array) => {
        if (room._id.toString() === room_id) {
            return room;
        }
    });
    return rooms[0];
};
export const UPDATED_CHATROOMS = "UPDATED_CHATROOMS";
export const updatedChatRoomSuccess = (chatrooms) => ({ type: UPDATED_CHATROOMS, payload: chatrooms });
export const updateChatRoom = (rooms) => {
    let chatrooms = getStore().getState().chatroomReducer.get("chatrooms");
    if (chatrooms) {
        // R.unionWith(R.eqBy(R.prop('a')), l1, l2);
        const newRooms = R.unionWith(R.eqBy(R.prop("_id")), rooms, chatrooms);
        getStore().dispatch(updatedChatRoomSuccess(newRooms));
    }
    else {
        chatrooms = rooms.slice();
        getStore().dispatch(updatedChatRoomSuccess(chatrooms));
    }
};
const GET_CHAT_TARGET_UID = "GET_CHAT_TARGET_UID";
export const GET_CHAT_TARGET_UID_SUCCESS = "GET_CHAT_TARGET_UID_SUCCESS";
export const GET_CHAT_TARGET_UID_FAILURE = "GET_CHAT_TARGET_UID_FAILURE";
const getChatTargetId = createAction(GET_CHAT_TARGET_UID, (room_id) => room_id);
const getChatTargetIdSuccess = createAction(GET_CHAT_TARGET_UID_SUCCESS, (payload) => payload);
const getChatTargetIdFailure = createAction(GET_CHAT_TARGET_UID_FAILURE, (error) => error);
export function getChatTargetIds(room_id) {
    return (dispatch) => {
        dispatch(getChatTargetId(room_id));
        const { room } = getStore().getState().chatroomReducer;
        const { _id } = authReducer().user;
        if (!room) {
            dispatch(getChatTargetIdFailure("Has no room object!"));
        }
        else {
            const results = new Array();
            room.members.map((value) => (value._id !== _id) ? results.push(value._id) : null);
            dispatch(getChatTargetIdSuccess(results));
        }
    };
}