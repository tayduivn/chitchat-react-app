﻿/**
 * Copyright 2016 Ahoo Studio.co.th.
 *
 * ChatRoomComponent for handle some business logic of chat room.
 */
import * as Rx from "rxjs/Rx";
import * as async from "async";
import { ServerImplemented } from "stalk-js";
import { ChitChatFactory } from "./ChitChatFactory";
const authReducer = () => ChitChatFactory.getInstance().authStore;

import { IRoomAccessListenerImp } from "./abstracts/IRoomAccessListenerImp";
import ChatLog from "./models/chatLog";
import { DataListener } from "./DataListener";
import { BackendFactory } from "./BackendFactory";
import * as CryptoHelper from "./utils/CryptoHelper";
import { IMessage, MessageType, IMessageMeta } from "../shared/Message";
import { Room, RoomStatus, RoomType } from "./models/Room";
import { RoomAccessData, StalkAccount } from "../shared/Stalk";
import { ContactInfo } from "./models/Contact";
import { MessageImp } from "./models/MessageImp";
import { MemberImp } from "./models/MemberImp";

import * as chatroomService from "./services/chatroomService";
import * as chatlogActionsHelper from "./redux/chatlogs/chatlogActionsHelper";

export class Unread { message: MessageImp; rid: string; count: number; }
export type ChatLogMap = Map<string, ChatLog>;
export type UnreadMap = Map<string, Unread>;

class ChatsLogComponent implements IRoomAccessListenerImp {
    dataListener: DataListener;

    private chatlog_count: number = 0;
    public _isReady: boolean;
    public onReady: (rooms: Array<Room>) => void;
    public getRoomsInfoCompleteEvent: () => void;
    private chatslog = new Map<string, ChatLog>();
    public getChatsLog(): Array<ChatLog> {
        return Array.from(this.chatslog.values());
    }

    private unreadMessageMap = new Map<string, Unread>();
    public getUnreadMessageMap(): UnreadMap {
        return this.unreadMessageMap;
    }
    public setUnreadMessageMap(unreads: Array<Unread>) {
        unreads.map(v => {
            this.unreadMessageMap.set(v.rid, v);
        });
    }
    public addUnreadMessage(unread: Unread) {
        this.unreadMessageMap.set(unread.rid, unread);
    }
    public getUnreadItem(room_id: string) {
        return this.unreadMessageMap.get(room_id);
    }
    public updatedLastAccessTimeEvent: (data: RoomAccessData) => void;
    onUpdatedLastAccessTime(data: RoomAccessData) {
        if (!!this.updatedLastAccessTimeEvent) {
            this.updatedLastAccessTimeEvent(data);
        }
    }

    constructor() {
        this._isReady = false;
        let backendFactory = BackendFactory.getInstance();
        this.dataListener = backendFactory.dataListener;

        this.dataListener.addOnRoomAccessListener(this.onAccessRoom.bind(this));
        this.dataListener.addOnChatListener(this.onChat.bind(this));
        this.dataListener.addOnAddRoomAccessListener(this.onAddRoomAccess.bind(this));
        this.dataListener.addOnUpdateRoomAccessListener(this.onUpdatedLastAccessTime.bind(this));
    }

    private chatListeners = new Array<(param) => void>();
    public addOnChatListener(listener) {
        this.chatListeners.push(listener);
    }
    onChat(message) {
        console.log("ChatsLogComponent.onChat", message);
        let self = this;

        CryptoHelper.decryptionText(message).then((decoded) => {
            // Provide chatslog service.
            self.chatListeners.map((v, i, a) => {
                v(decoded);
            });
        });
    }

    onAccessRoom(dataEvent: StalkAccount) {
        let self = this;

        this.unreadMessageMap.clear();
        this.chatslog.clear();

        let roomAccess = dataEvent.roomAccess as Array<RoomAccessData>;
        let results = new Array<Room>();

        if (roomAccess.length > 0) {
            let source = Rx.Observable.from(roomAccess);
            source.flatMap(async (item) => {
                try {
                    let room = await self.getRoomInfo(item.roomId);
                    if (room) {
                        results.push(room);
                    }

                    return room;
                }
                catch (ex) {
                    return null;
                }
            }).subscribe(room => { },
                (err) => console.error("error", err),
                () => {
                    self._isReady = true;

                    if (!!self.onReady) {
                        self.onReady(results);
                    }
                });
        }
        else {
            self._isReady = true;

            if (!!self.onReady) {
                self.onReady(results);
            }
        }
    }

    public addNewRoomAccessEvent: (data) => void;
    onAddRoomAccess(dataEvent) {
        console.warn("ChatsLogComponent.onAddRoomAccess", JSON.stringify(dataEvent));

        if (!!this.addNewRoomAccessEvent) {
            this.addNewRoomAccessEvent(dataEvent);
        }
    }

    public getUnreadMessages(user_id: string, roomAccess: RoomAccessData[],
        callback: (err: Error | null, logsData: Array<Unread>) => void) {
        let self = this;
        let unreadLogs = new Array<Unread>();

        // create a queue object with concurrency 2
        let q = async.queue(function (task: RoomAccessData, callback: () => void) {
            if (!!task.roomId && !!task.accessTime) {
                self.getUnreadMessage(user_id, task).then(value => {
                    unreadLogs.push(value);
                    callback();
                }).catch(err => {
                    callback();
                });
            } else {
                callback();
            }
        }, 10);

        // assign a callback
        q.drain = function () {
            console.log("getUnreadMessages from your roomAccess is done.");
            callback(null, unreadLogs);
        };

        // add some items to the queue (batch-wise)
        if (roomAccess && roomAccess.length > 0) {
            q.push(roomAccess, function (err) { });
        }
        else {
            callback(null, null);
        }
    }

    public async getUnreadMessage(user_id: string, roomAccess: RoomAccessData) {
        let response = await chatroomService.getUnreadMessage(roomAccess.roomId, user_id, roomAccess.accessTime.toString());
        let value = await response.json();

        if (value.success) {
            let unread = value.result as Unread;
            unread.rid = roomAccess.roomId;
            let decoded = await CryptoHelper.decryptionText(unread.message as MessageImp);

            return unread;
        }
        else {
            throw new Error(value.message);
        }
    }

    private async decorateRoomInfoData(roomInfo: Room) {
        if (roomInfo.type == RoomType.privateChat) {
            if (Array.isArray(roomInfo.members)) {
                let others = roomInfo.members.filter((value) =>
                    value._id != authReducer().user._id) as Array<MemberImp>;

                if (others.length > 0) {
                    let contact = others[0];
                    let avatar;
                    if (!contact.avatar) {
                        let user = await chatlogActionsHelper.getContactProfile(contact._id);
                        if (!!user)
                            avatar = user.avatar;
                    }

                    roomInfo.name = (contact.username) ? contact.username : "EMPTY ROOM";
                    roomInfo.image = (contact.avatar) ? contact.avatar : avatar;
                }
            }
        }

        return roomInfo;
    }

    private async getRoomInfo(room_id: string) {
        let self = this;

        let response = await chatroomService.getRoomInfo(room_id);
        let json = await response.json();

        if (json.success) {
            let roomInfos = json.result as Array<Room>;
            let room = await self.decorateRoomInfoData(roomInfos[0]);

            return room;
        }
        else {
            throw new Error(json.message);
        }
    }

    public getRoomsInfo(user_id: string, chatrooms: Array<Room>) {
        let self = this;

        // create a queue object with concurrency 2
        let q = async.queue(function (task, callback) {
            let value = task as Unread;
            let rooms = chatrooms.filter(v => v._id == value.rid);
            let roomInfo = (rooms.length > 0) ? rooms[0] : null;
            if (!!roomInfo) {
                self.decorateRoomInfoData(roomInfo).then(room => {
                    chatrooms.forEach(v => {
                        if (v._id == room._id) {
                            v = room;
                        }
                    });

                    self.organizeChatLogMap(value, room, function done() {
                        callback();
                    });
                }).catch(err => {
                    callback();
                });
            }
            else {
                console.log("Can't find roomInfo from persisted data: ", value.rid);

                self.getRoomInfo(value.rid).then(room => {
                    chatrooms.forEach(v => {
                        if (v._id == room._id) {
                            v = room;
                        }
                    });

                    self.organizeChatLogMap(value, room, function done() {
                        callback();
                    });
                }).catch(err => {
                    callback();
                });
            }
        }, 10);

        // assign a callback
        q.drain = function () {
            console.log("getRoomsInfo Completed.");
            if (self.getRoomsInfoCompleteEvent())
                self.getRoomsInfoCompleteEvent();
        };

        this.unreadMessageMap.forEach((value, key, map) => {
            // add some items to the queue
            q.push(value, function (err) { });
        });
    }

    public manageChatLog(chatrooms: Array<Room>): Promise<ChatLogMap> {
        let self = this;

        return new Promise((resolve, rejected) => {
            // create a queue object with concurrency 2
            let q = async.queue(function (task, callback) {
                let unread = task as Unread;
                let rooms = chatrooms.filter(v => v._id == unread.rid);
                let room = (rooms.length > 0) ? rooms[0] : null;
                if (!room) {
                    callback();
                }

                self.organizeChatLogMap(unread, room as Room, () => {
                    callback();
                });
            }, 2);

            // assign a callback
            q.drain = function () {
                resolve(self.chatslog);
            };

            this.unreadMessageMap.forEach((value, key, map) => {
                // add some items to the queue
                q.push(value, function (err) { });
            });
        });
    }

    private async organizeChatLogMap(unread: Unread, roomInfo: Room, done: () => void) {
        if (!roomInfo) return;

        let self = this;
        let log = new ChatLog(roomInfo);
        log.setNotiCount(unread.count);

        if (!!unread.message) {
            log.setLastMessageTime(unread.message.createTime.toString());

            let sender = (!!unread.message) ? unread.message.user.username : "";

            if (unread.message.body != null) {
                let displayMsg = unread.message.body;
                switch (`${unread.message.type}`) {
                    case MessageType[MessageType.Text]:
                        /*
                            self.main.decodeService(displayMsg, function (err, res) {
                                if (!err) {
                                    displayMsg = res;
                                } else { console.warn(err, res); }
                            });
                        */
                        self.setLogProp(log, displayMsg, function (log) {
                            self.addChatLog(log, done);
                        });
                        break;
                    case MessageType[MessageType.Sticker]:
                        displayMsg = sender + " sent a sticker.";
                        self.setLogProp(log, displayMsg, function (log) {
                            self.addChatLog(log, done);
                        });
                        break;
                    case MessageType[MessageType.Voice]:
                        displayMsg = sender + " sent a voice message.";
                        self.setLogProp(log, displayMsg, function (log) {
                            self.addChatLog(log, done);
                        });
                        break;
                    case MessageType[MessageType.Image]:
                        displayMsg = sender + " sent a image.";
                        self.setLogProp(log, displayMsg, function (log) {
                            self.addChatLog(log, done);
                        });
                        break;
                    case MessageType[MessageType.Video]:
                        displayMsg = sender + " sent a video.";
                        self.setLogProp(log, displayMsg, function (log) {
                            self.addChatLog(log, done);
                        });
                        break;
                    case MessageType[MessageType.Location]:
                        displayMsg = sender + " sent a location.";
                        self.setLogProp(log, displayMsg, function (log) {
                            self.addChatLog(log, done);
                        });
                        break;
                    case MessageType[MessageType.File]:
                        self.setLogProp(log, displayMsg, function (log) {
                            self.addChatLog(log, done);
                        });
                        break;
                    default:
                        console.log("bobo");
                        break;
                }
            }
        }
        else {
            let displayMsg = "Start Chatting Now!";
            self.setLogProp(log, displayMsg, function (log) {
                self.addChatLog(log, done);
            });
        }
    }

    private setLogProp(log: ChatLog, displayMessage, callback: (log: ChatLog) => void) {
        log.setLastMessage(displayMessage);

        callback(log);
    }
    private addChatLog(chatLog: ChatLog, done: () => void) {
        this.chatslog.set(chatLog.id, chatLog);
        done();
    }
    public checkRoomInfo(unread: Unread, chatrooms: Array<Room>): Promise<Room> {
        let self = this;
        return new Promise((resolve, rejected) => {
            let rooms = (!!chatrooms && chatrooms.length > 0) ? chatrooms.filter(v => v._id == unread.rid) : [];
            let roomInfo = rooms[0] as Room;
            if (!roomInfo) {
                console.warn("No have roomInfo in room store.", unread.rid);

                self.getRoomInfo(unread.rid).then(room => {
                    this.organizeChatLogMap(unread, room, () => {
                        resolve(room);
                    });
                }).catch(err => {
                    rejected(err);
                });
            }
            else {
                this.organizeChatLogMap(unread, roomInfo, () => {
                    resolve();
                });
            }
        });
    }

    public getChatsLogCount(): number {
        return this.chatlog_count;
    }
    public increaseChatsLogCount(num: number) {
        this.chatlog_count += num;
    }
    public decreaseChatsLogCount(num: number) {
        this.chatlog_count -= num;
    }
    public calculateChatsLogCount() {
        this.chatlog_count = 0;
        this.unreadMessageMap.forEach((value, key) => {
            let count = value.count;
            this.chatlog_count += count;
        });
    }
}