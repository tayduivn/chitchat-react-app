/**
 * Copyright 2016 Ahoo Studio.co.th.
 *
 * This is pure function action for redux app.
 */
import BackendFactory from "../../chats/BackendFactory";
// import NotificationManager from "../../chats/notificationManager";
import * as DataModels from "../../chats/models/ChatDataModels";
import Store from "../configureStore";
import * as ChatLogsActions from "../chatlogs/chatlogsActions";
import * as StalkPushActions from "./stalkPushActions";
export const STALK_GET_PRIVATE_CHAT_ROOM_ID_REQUEST = "STALK_GET_PRIVATE_CHAT_ROOM_ID_REQUEST";
export const STALK_GET_PRIVATE_CHAT_ROOM_ID_FAILURE = "STALK_GET_PRIVATE_CHAT_ROOM_ID_FAILURE";
export const STALK_GET_PRIVATE_CHAT_ROOM_ID_SUCCESS = "STALK_GET_PRIVATE_CHAT_ROOM_ID_SUCCESS";
export const getSessionToken = () => {
    const backendFactory = BackendFactory.getInstance();
    return backendFactory.dataManager.getSessionToken();
};
export const getRoomDAL = () => {
    const backendFactory = BackendFactory.getInstance();
    return backendFactory.dataManager.roomDAL;
};
export const onStalkLoginSuccess = new Array();
const onGetContactProfileFail = (contact_id) => {
};
export function getUserInfo(userId, callback) {
    let self = this;
    let dataManager = BackendFactory.getInstance().dataManager;
    let user = dataManager.getContactProfile(userId);
    callback(user);
}
export function stalkLoginWithToken(uid, token) {
    console.log("stalkLoginWithToken", uid, token);
    const backendFactory = BackendFactory.getInstance();
    backendFactory.stalkInit().then(value => {
        backendFactory.checkIn(uid, token, null).then(value => {
            console.log("Joined chat-server success", value.code);
            let result = JSON.parse(value.data);
            if (result.success) {
                backendFactory.getServerListener();
                backendFactory.startChatServerListener();
                // NotificationManager.getInstance().regisNotifyNewMessageEvent();
                let msg = {};
                msg["token"] = token;
                backendFactory.getServer().then(server => {
                    server.getMe(msg, (err, res) => {
                        console.log("MyChat-Profile", res);
                        let account = new DataModels.StalkAccount();
                        account._id = result.decoded._id;
                        account.displayname = result.decoded.email;
                        let data = (!!res.data) ? res.data : account;
                        backendFactory.dataManager.setProfile(data).then(profile => {
                            console.log("set chat profile success", profile);
                            ChatLogsActions.initChatsLog();
                        });
                        backendFactory.dataManager.setSessionToken(token);
                        backendFactory.dataManager.addContactInfoFailEvents(onGetContactProfileFail);
                        StalkPushActions.stalkPushInit();
                    });
                }).catch(err => {
                    console.warn("Chat-server not yet ready");
                });
            }
            else {
                console.warn("Cannot joined chat server.");
            }
        }).catch(err => {
            console.warn("Cannot checkIn", err);
        });
    }).catch(err => {
        console.warn("StalkInit Fail.");
    });
}
export function stalkLogin(user) {
    console.log("stalkLogin init status", Store.getState().stalkReducer.isInit);
    if (Store.getState().stalkReducer.isInit)
        return;
    const backendFactory = BackendFactory.getInstance();
    backendFactory.stalkInit().then(value => {
        backendFactory.checkIn(user._id, null, user).then(value => {
            console.log("Joined chat-server success", value);
            let result = JSON.parse(JSON.stringify(value.data));
            if (result.success) {
                backendFactory.getServerListener();
                backendFactory.startChatServerListener();
                // NotificationManager.getInstance().regisNotifyNewMessageEvent();
                console.log("MyChat-Profile", user);
                let account = new DataModels.StalkAccount();
                account._id = user._id;
                account.displayname = user.username;
                backendFactory.dataManager.setProfile(account).then(profile => {
                    console.log("set chat profile success", profile);
                    ChatLogsActions.initChatsLog();
                });
                backendFactory.dataManager.setSessionToken(result.token);
                backendFactory.dataManager.addContactInfoFailEvents(onGetContactProfileFail);
                StalkPushActions.stalkPushInit();
                if (onStalkLoginSuccess.length > 0)
                    onStalkLoginSuccess.map(item => item());
            }
            else {
                console.warn("Cannot joined chat server.");
            }
        }).catch(err => {
            console.warn("Cannot checkIn", err);
        });
    }).catch(err => {
        console.warn("StalkInit Fail.");
    });
}
