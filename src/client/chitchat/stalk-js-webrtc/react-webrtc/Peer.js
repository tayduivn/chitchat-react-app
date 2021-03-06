import { EventEmitter } from "events";
import { AbstractPeer, AbstractPeerConnection } from "../";
import { getImage } from '../libs/VideoToBlurImage';
import { createStreamByText } from '..//libs/StreamHelper';
const configuration = { "iceServers": [{ "urls": "stun:stun.l.google.com:19302" }] };
export class Peer extends AbstractPeer.BasePeer {
    constructor(config) {
        super(config);
        this.initPeerConnection(config.stream);
    }
    initPeerConnection(stream) {
        let self = this;
        self.channels = {};
        self.pcEvent = new EventEmitter();
        this.pc = new RTCPeerConnection(configuration);
        this.pc.onicecandidate = function (event) {
            if (event.candidate) {
                self.send_event(AbstractPeerConnection.CANDIDATE, event.candidate, { to: self.id });
            }
        };
        this.pc.onnegotiationneeded = function () {
            if (self.offer) {
                self.createOffer();
                self.offer = false;
            }
        };
        this.pc.oniceconnectionstatechange = function (event) {
            let target = event.target;
            if (self.debug)
                console.log('oniceconnectionstatechange', target.iceConnectionState);
            self.pcEvent.emit("oniceconnectionstatechange", target.iceConnectionState);
            if (target.iceConnectionState === 'completed') {
            }
            else if (target.iceConnectionState === 'connected') {
                self.createDataChannel("message");
                self.pc.ondatachannel = self.receiveChannelCallback.bind(self);
            }
            else if (target.iceConnectionState == "failed") {
                self.parentsEmitter.emit(AbstractPeerConnection.ON_ICE_CONNECTION_FAILED, self.pc);
                self.send_event(AbstractPeerConnection.CONNECTIVITY_ERROR, null, { to: self.id });
            }
        };
        this.pc.onicegatheringstatechange = (event) => {
            let target = event.target;
            if (self.debug)
                console.log("onicegatheringstatechange", target.iceGatheringState);
            self.pcEvent.emit("onicegatheringstatechange", target.iceGatheringState);
        };
        this.pc.onsignalingstatechange = function (event) {
            let target = event.target;
            if (self.debug)
                console.log('onsignalingstatechange', target.signalingState);
            self.pcEvent.emit("onsignalingstatechange", target.signalingState);
        };
        this.pc.onaddstream = function (peer) {
            if (self.debug)
                console.log('onaddstream');
            self.parentsEmitter.emit(AbstractPeerConnection.PEER_STREAM_ADDED, peer);
        };
        this.pc.onremovestream = function (peer) {
            if (self.debug)
                console.log('onremovestream');
            self.parentsEmitter.emit(AbstractPeerConnection.PEER_STREAM_REMOVED, peer.stream);
        };
        this.pc.addStream(stream);
        self.parentsEmitter.emit(AbstractPeerConnection.CREATED_PEER, self);
    }
    getStats() {
        let self = this;
        const peer = this.pcPeers[Object.keys(this.pcPeers)[0]];
        const pc = peer.pc;
        if (pc.getRemoteStreams()[0] && pc.getRemoteStreams()[0].getAudioTracks()[0]) {
            const track = pc.getRemoteStreams()[0].getAudioTracks()[0];
            pc.getStats(track, (report) => {
                console.log('getStats report', report);
            }, self.logError);
        }
    }
    handleMessage(message) {
        let self = this;
        if (self.debug)
            console.log('handleMessage', message.type);
        if (message.prefix)
            this.browserPrefix = message.prefix;
        if (message.type === AbstractPeerConnection.OFFER) {
            if (!this.nick)
                this.nick = message.payload.nick;
            delete message.payload.nick;
            self.pc.setRemoteDescription(new RTCSessionDescription(message.payload), function () {
                if (self.debug)
                    console.log("setRemoteDescription complete");
                if (self.pc.remoteDescription.type == AbstractPeerConnection.OFFER) {
                    self.createAnswer(message);
                }
            }, self.onSetSessionDescriptionError);
        }
        else if (message.type === AbstractPeerConnection.ANSWER) {
        }
        else if (message.type === AbstractPeerConnection.CANDIDATE) {
            if (!message.candidate)
                return;
            function onAddIceCandidateSuccess() {
                if (self.debug)
                    console.log('addIceCandidate success');
            }
            function onAddIceCandidateError(error) {
                console.warn('failed to add ICE Candidate: ' + error.toString());
            }
            self.pc.addIceCandidate(new RTCIceCandidate(message.candidate), onAddIceCandidateSuccess, onAddIceCandidateError);
        }
        else if (message.type === AbstractPeerConnection.CONNECTIVITY_ERROR) {
            this.parentsEmitter.emit(AbstractPeerConnection.CONNECTIVITY_ERROR, self.pc);
        }
        else if (message.type === 'endOfCandidates') {
            console.log(message.type);
            let mLines = this.pc.pc.transceivers || [];
            mLines.forEach(function (mLine) {
                if (mLine.iceTransport) {
                    mLine.iceTransport.addRemoteCandidate({});
                }
            });
        }
    }
    ;
    sendDirectly(channel, messageType, payload) {
        let message = {
            type: messageType,
            payload: payload
        };
        console.log('sending via datachannel', channel, messageType, message);
        let dc = this.getDataChannel(channel);
        if (dc.readyState != 'open')
            return false;
        dc.send(JSON.stringify(message));
        return true;
    }
    ;
    getDataChannel(name) {
        let channel = this.channels[name];
        if (channel)
            return channel;
        return this.createDataChannel(name);
    }
    createDataChannel(name) {
        let self = this;
        let dataConstraint = null;
        if (this.channels[name]) {
            return;
        }
        let channel = this.channels[name] = this.pc.createDataChannel(name, dataConstraint);
        channel.onerror = function (error) {
            console.log("dataChannel.onerror", error);
        };
        channel.onmessage = function (event) {
            console.log("dataChannel.onmessage:", event.data);
        };
        channel.onopen = function () {
            console.log('dataChannel.onopen');
        };
        channel.onclose = function () {
            console.log("dataChannel.onclose");
        };
        return channel;
    }
    receiveChannelCallback(event) {
        console.log('Receive Channel', event.channel.label);
        this.receiveChannel = event.channel;
        this.receiveChannel.onmessage = this.onReceiveMessageCallback.bind(this);
        this.receiveChannel.onopen = this.onReceiveChannelStateChange.bind(this);
        this.receiveChannel.onclose = this.onReceiveChannelStateChange.bind(this);
    }
    onReceiveChannelStateChange() {
        let readyState = this.receiveChannel.readyState;
        console.log('Receive channel state is: ' + readyState);
    }
    onReceiveMessageCallback(event) {
        console.log('Receive Message', event.data);
        const data = JSON.parse(event.data);
        let remoteVideoElement = document.getElementById('remoteVideos');
        let remoteAudioElement = document.getElementById('remoteAudio');
        if (data.type === AbstractPeerConnection.UNPAUSE) {
            remoteVideoElement.srcObject = this.pc.getRemoteStreams()[0];
        }
        else if (data.type === AbstractPeerConnection.PAUSE) {
            remoteAudioElement.srcObject = this.pc.getRemoteStreams()[0];
            getImage(remoteVideoElement).then((res) => {
                console.warn('getImage', res);
                remoteVideoElement.srcObject = res;
            });
        }
        else if (data.type === AbstractPeerConnection.DUMMY_VIDEO) {
            let canvasStream = createStreamByText("NO CAMERA");
            if (!!canvasStream)
                remoteVideoElement.srcObject = canvasStream;
        }
    }
}
