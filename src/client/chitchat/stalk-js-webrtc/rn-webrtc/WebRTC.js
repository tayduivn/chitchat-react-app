import * as events from 'events';
import * as io from 'socket.io-client';
import { AbstractWEBRTC } from "../index";
import { withExchange, withSendMessage } from "../WebrtcSignaling";
import { PeerManager } from "./PeerManager";
import { UserMedia } from "./UserMedia";
export function logError(error) {
    console.log("logError", error);
}
export class WebRTC {
    constructor(configs) {
        this.debug = false;
        let self = this;
        self.debug = configs.debug;
        this.signalingSocket = io.connect(configs.signalingUrl, configs.socketOptions);
        this.webrtcEvents = new events.EventEmitter();
        this.send = this.send.bind(this);
        this.onDisconnect = this.onDisconnect.bind(this);
        this.peerManager = new PeerManager({ debug: self.debug });
        this.userMedia = new UserMedia({ debug: self.debug });
        self.signalingSocket.on('connect', function (data) {
            if (self.debug)
                console.log("SOCKET connect", self.signalingSocket.id);
            self.webrtcEvents.emit(AbstractWEBRTC.ON_CONNECTION_READY, self.signalingSocket.id);
        });
        self.signalingSocket.on('message', function (data) {
            withExchange(self)(data);
        });
        self.signalingSocket.on('remove', function (room) {
            if (self.debug)
                console.log("SOCKET remove", room, self.signalingSocket.id);
            if (room.id !== self.signalingSocket.id) {
                self.peerManager.removePeers(room.id, self);
            }
        });
        self.signalingSocket.on('leave', function (socketId) {
            if (self.debug)
                console.log("SOCKET leave", socketId);
            self.peerManager.removePeers(socketId, self);
        });
        self.signalingSocket.on('disconnect', this.onDisconnect);
        self.signalingSocket.on('reconnect', (data) => {
            console.log("SOCKET reconnect", data);
        });
        self.signalingSocket.on('reconnectAttempt', (data) => {
            console.log("SOCKET reconnectAttempt", data);
        });
        self.signalingSocket.on('error', (data) => {
            console.log("SOCKET error", data);
        });
        self.signalingSocket.on('*', function (data) {
            console.log("SOCKET ***", data);
        });
    }
    send(messageType, payload, optional) {
        withSendMessage(this)(messageType, payload, optional);
    }
    ;
    join(roomname) {
        let self = this;
        this.signalingSocket.emit('join', roomname, function (err, roomDescription) {
            console.log('join', roomDescription);
            if (err) {
                self.webrtcEvents.emit(AbstractWEBRTC.JOIN_ROOM_ERROR, err);
            }
            else {
                let id, client, type, peer;
                let clients = roomDescription.clients;
                for (id in clients) {
                    console.log("id", id);
                    if (clients.hasOwnProperty(id)) {
                        client = clients[id];
                        for (type in client) {
                            if (client[type]) {
                                peer = self.peerManager.createPeer({
                                    id: id,
                                    type: type,
                                    offer: true
                                }, self);
                                self.webrtcEvents.emit(AbstractWEBRTC.CREATED_PEER, peer);
                            }
                        }
                    }
                }
            }
            self.roomName = roomname;
            self.webrtcEvents.emit(AbstractWEBRTC.JOINED_ROOM, roomname);
        });
    }
    leaveRoom() {
        if (this.roomName) {
            this.signalingSocket.emit('leave');
            this.roomName = "";
        }
    }
    ;
    disconnect() {
        this.signalingSocket.disconnect();
        this.userMedia.stopLocalStream();
        delete this.peerManager;
        delete this.signalingSocket;
        delete this.userMedia;
    }
    ;
    onDisconnect(data) {
        console.log("SOCKET disconnect", data);
        this.userMedia.stopLocalStream();
    }
}
