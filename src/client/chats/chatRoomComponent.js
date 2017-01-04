/**
 * Copyright 2016 Ahoo Studio.co.th.
 *
 * ChatRoomComponent for handle some business logic of chat room.
 */
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
const async = require("async");
const BackendFactory_1 = require("./BackendFactory");
const serverImplemented_1 = require("../libs/stalk/serverImplemented");
const serverEventListener_1 = require("../libs/stalk/serverEventListener");
const secureServiceFactory_1 = require("../libs/chitchat/services/secureServiceFactory");
const ChatDataModels_1 = require("./models/ChatDataModels");
const config_1 = require("../configs/config");
let serverImp = null;
class ChatRoomComponent {
    static getInstance() {
        if (!ChatRoomComponent.instance) {
            ChatRoomComponent.instance = new ChatRoomComponent();
        }
        return ChatRoomComponent.instance;
    }
    getRoomId() {
        return this.roomId;
    }
    setRoomId(rid) {
        this.roomId = rid;
    }
    constructor() {
        this.secure = secureServiceFactory_1.default.getService();
        this.chatRoomApi = BackendFactory_1.default.getInstance().getChatApi();
        BackendFactory_1.default.getInstance().getServer().then(server => {
            serverImp = server;
        }).catch(err => {
        });
        this.dataManager = BackendFactory_1.default.getInstance().dataManager;
    }
    onChat(message) {
        let self = this;
        this.dataManager.messageDAL.getData(this.roomId).then((chatMessages) => {
            return chatMessages;
        }).catch(err => {
            console.warn("Cannot get persistend message of room", err);
            return new Array();
        }).then((chatMessages) => {
            if (this.roomId === message.rid) {
                if (message.type == ChatDataModels_1.ContentType[ChatDataModels_1.ContentType.Text]) {
                    if (config_1.default.appConfig.encryption == true) {
                        self.secure.decryptWithSecureRandom(message.body, (err, res) => {
                            if (!err) {
                                message.body = res;
                                chatMessages.push(message);
                                self.dataManager.messageDAL.saveData(self.roomId, chatMessages);
                                if (!!this.chatroomDelegate)
                                    this.chatroomDelegate(serverEventListener_1.default.ON_CHAT, message);
                            }
                            else {
                                console.log(err, res);
                                chatMessages.push(message);
                                self.dataManager.messageDAL.saveData(self.roomId, chatMessages);
                                if (!!this.chatroomDelegate)
                                    this.chatroomDelegate(serverEventListener_1.default.ON_CHAT, message);
                            }
                        });
                    }
                    else {
                        chatMessages.push(message);
                        self.dataManager.messageDAL.saveData(self.roomId, chatMessages);
                        if (!!this.chatroomDelegate)
                            this.chatroomDelegate(serverEventListener_1.default.ON_CHAT, message);
                    }
                }
                else {
                    chatMessages.push(message);
                    self.dataManager.messageDAL.saveData(self.roomId, chatMessages);
                    if (!!this.chatroomDelegate)
                        this.chatroomDelegate(serverEventListener_1.default.ON_CHAT, message);
                }
            }
            else {
                console.warn("this msg come from other room.");
                if (!!this.outsideRoomDelegete) {
                    this.outsideRoomDelegete(serverEventListener_1.default.ON_CHAT, message);
                }
            }
        });
    }
    onLeaveRoom(data) {
    }
    onRoomJoin(data) {
    }
    onMessageRead(dataEvent) {
        console.log("onMessageRead", JSON.stringify(dataEvent));
        let self = this;
        let newMsg = JSON.parse(JSON.stringify(dataEvent));
        let promise = new Promise(function (resolve, reject) {
            self.chatMessages.some(function callback(value) {
                if (value._id === newMsg._id) {
                    value.readers = newMsg.readers;
                    if (!!self.chatroomDelegate)
                        self.chatroomDelegate(serverEventListener_1.default.ON_MESSAGE_READ, null);
                    resolve();
                    return true;
                }
            });
        }).then((value) => {
            self.dataManager.messageDAL.saveData(self.roomId, self.chatMessages);
        });
    }
    onGetMessagesReaders(dataEvent) {
        console.log('onGetMessagesReaders', dataEvent);
        let self = this;
        let myMessagesArr = JSON.parse(JSON.stringify(dataEvent.data));
        self.chatMessages.forEach((originalMsg, id, arr) => {
            if (BackendFactory_1.default.getInstance().dataManager.isMySelf(originalMsg.sender)) {
                myMessagesArr.some((myMsg, index, array) => {
                    if (originalMsg._id === myMsg._id) {
                        originalMsg.readers = myMsg.readers;
                        return true;
                    }
                });
            }
        });
        self.dataManager.messageDAL.saveData(self.roomId, self.chatMessages);
    }
    getPersistentMessage(rid) {
        let self = this;
        return new Promise((resolve, reject) => {
            self.dataManager.messageDAL.getData(rid).then(messages => {
                let chats = messages.slice(0);
                async.forEach(chats, function iterator(chat, result) {
                    if (chat.type === ChatDataModels_1.ContentType[ChatDataModels_1.ContentType.Text]) {
                        if (config_1.default.appConfig.encryption == true) {
                            self.secure.decryptWithSecureRandom(chat.body, function (err, res) {
                                if (!err) {
                                    chat.body = res;
                                }
                                result(null);
                            });
                        }
                        else {
                            result(null);
                        }
                    }
                    else {
                        result(null);
                    }
                }, (err) => {
                    console.log("decoded chats completed.", chats.length);
                    self.dataManager.messageDAL.saveData(rid, chats);
                    resolve(chats);
                });
            }).catch(err => {
                console.log("chatMessages is empty!");
                resolve(new Array());
            });
        });
    }
    getNewerMessageRecord(callback) {
        let self = this;
        let lastMessageTime = new Date();
        const getLastMessageTime = (cb) => {
            let roomAccess = self.dataManager.getRoomAccess();
            async.some(roomAccess, (item, cb) => {
                if (item.roomId === self.roomId) {
                    lastMessageTime = item.accessTime;
                    cb(null, true);
                }
                else
                    cb(null, false);
            }, (err, result) => {
                cb(result);
            });
        };
        self.dataManager.messageDAL.getData(this.roomId).then((messages) => {
            if (messages && messages.length > 0) {
                if (messages[messages.length - 1] != null) {
                    lastMessageTime = messages[messages.length - 1].createTime;
                    self.getNewerMessageFromNet(lastMessageTime, callback);
                }
                else {
                    getLastMessageTime((boo) => {
                        self.getNewerMessageFromNet(lastMessageTime, callback);
                    });
                }
            }
            else {
                getLastMessageTime((boo) => {
                    self.getNewerMessageFromNet(lastMessageTime, callback);
                });
            }
        }).catch(err => {
            console.error(err + ": Cannot get persistend message of room");
        });
    }
    getNewerMessageFromNet(lastMessageTime, callback) {
        let self = this;
        self.chatRoomApi.getChatHistory(self.roomId, lastMessageTime, function (err, result) {
            let histories = [];
            if (result.code === 200) {
                histories = result.data;
                console.log("Newer message counts.", histories.length);
                if (histories.length > 0) {
                    let messages = JSON.parse(JSON.stringify(histories));
                    async.forEach(messages, function (chat, cb) {
                        if (chat.type == ChatDataModels_1.ContentType[ChatDataModels_1.ContentType.Text]) {
                            if (config_1.default.appConfig.encryption == true) {
                                self.secure.decryptWithSecureRandom(chat.body, function (err, res) {
                                    if (!err) {
                                        chat.body = res;
                                    }
                                    cb(null);
                                });
                            }
                            else {
                                cb(null);
                            }
                        }
                        else {
                            cb(null);
                        }
                    }, function done(err) {
                        if (!err) {
                            console.log("get newer message completed.", messages.length);
                        }
                        else {
                            console.error('get newer message error', err);
                        }
                        //<!-- Save persistent chats log here.
                        self.dataManager.messageDAL.saveData(self.roomId, messages);
                        if (callback !== null) {
                            callback(null, result.code);
                        }
                    });
                }
                else {
                    console.log("Have no newer message.");
                    if (callback !== null) {
                        callback(null, result.code);
                    }
                }
            }
            else {
                console.warn("WTF god only know.", result.message);
                if (callback !== null) {
                    callback(null, result.code);
                }
            }
        });
    }
    getOlderMessageChunk(callback) {
        let self = this;
        function waitForRoomMessage() {
            return __awaiter(this, void 0, void 0, function* () {
                let messages = yield self.dataManager.messageDAL.getData(self.roomId);
                return messages;
            });
        }
        self.getTopEdgeMessageTime(function done(err, res) {
            self.chatRoomApi.getOlderMessageChunk(self.roomId, res, function response(err, res) {
                //@ todo.
                /**
                 * Merge messages record to chatMessages array.
                 * Never save message to persistend layer.
                 */
                if (res.code == 200) {
                    let datas = res.data;
                    let earlyMessages = datas;
                    waitForRoomMessage().then(messages => {
                        if (!!messages && messages.length > 0) {
                            let mergedArray = [];
                            if (earlyMessages.length > 0) {
                                mergedArray = earlyMessages.concat(messages);
                            }
                            let resultsArray = [];
                            async.map(mergedArray, function iterator(item, cb) {
                                let hasMessage = resultsArray.some(function itor(value, id, arr) {
                                    if (!!value && value._id == item._id) {
                                        return true;
                                    }
                                });
                                if (hasMessage == false) {
                                    resultsArray.push(item);
                                    cb(null, null);
                                }
                                else {
                                    cb(null, null);
                                }
                            }, function done(err, results) {
                                let merged = resultsArray.sort(self.compareMessage);
                                self.dataManager.messageDAL.saveData(self.roomId, merged).then(value => {
                                    callback(null, value);
                                });
                            });
                        }
                        else {
                            let merged = earlyMessages.sort(self.compareMessage);
                            self.dataManager.messageDAL.saveData(self.roomId, merged).then(value => {
                                callback(null, value);
                            });
                        }
                    }).catch(err => {
                        console.error(err + ": Cannot get room message/");
                    });
                }
                else {
                    callback(res, null);
                }
            });
        });
    }
    checkOlderMessages(callback) {
        let self = this;
        self.getTopEdgeMessageTime(function done(err, res) {
            self.chatRoomApi.checkOlderMessagesCount(self.roomId, res, function response(err, res) {
                callback(err, res);
            });
        });
    }
    getTopEdgeMessageTime(callback) {
        let self = this;
        let topEdgeMessageTime = new Date();
        function waitRoomMessage() {
            return __awaiter(this, void 0, void 0, function* () {
                let messages = yield self.dataManager.messageDAL.getData(self.roomId);
                if (!!messages && messages.length > 0) {
                    if (!!messages[0].createTime) {
                        topEdgeMessageTime = messages[0].createTime;
                    }
                }
                console.log('topEdgeMessageTime is: ', topEdgeMessageTime);
            });
        }
        waitRoomMessage().then(() => {
            callback(null, topEdgeMessageTime);
        }).catch(err => {
            console.error(err + "\/Cannot get room message/");
        });
    }
    compareMessage(a, b) {
        if (a.createTime > b.createTime) {
            return 1;
        }
        if (a.createTime < b.createTime) {
            return -1;
        }
        // a must be equal to b
        return 0;
    }
    updateReadMessages() {
        let self = this;
        async.map(self.chatMessages, function itorator(message, resultCb) {
            if (!BackendFactory_1.default.getInstance().dataManager.isMySelf(message.sender)) {
                self.chatRoomApi.updateMessageReader(message._id, message.rid);
            }
            resultCb(null, null);
        }, function done(err) {
            //@ done.
        });
    }
    updateWhoReadMyMessages() {
        let self = this;
        self.getTopEdgeMessageTime((err, res) => {
            self.chatRoomApi.getMessagesReaders(res);
        });
    }
    getMemberProfile(member, callback) {
        serverImplemented_1.default.getInstance().getMemberProfile(member._id, callback);
    }
    getMessages() {
        return this.dataManager.messageDAL.getData(this.roomId);
    }
    dispose() {
        ChatRoomComponent.instance = null;
    }
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = ChatRoomComponent;
