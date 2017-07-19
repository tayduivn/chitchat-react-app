/*
This is a Tutorial App with a simpleWebRTC React component.
Compatible with Chrome and Firefox.

1. To join a room uncomment the line 76 in readyToCall(){...} and provide a room name in joinRoom('change-this-roomname').
2. The app by default uses the signal server from simplewebrtc.com. To use a custom Signal server such as the one in  https://github.com/andyet/signalmaster, provide your url link in the code (line 38) as shown in the example at https://simplewebrtc.com/notsosimple.html.
*/
import * as React from "react";
import * as ReactDOM from 'react-dom';
import { connect } from "react-redux";
import { shallowEqual } from "recompose";
import { withRouter } from "react-router-dom";
import Flexbox from "flexbox-react";
import { signalingServer } from "../../Chitchat";
import * as chatroom from "../../chitchat/chats/redux/chatroom/";
import * as calling from "../../chitchat/calling/";
const SimpleWebRTC = require('../../chitchat/libs/simplewebrtc');
class WebRtc extends React.Component {
    constructor(props) {
        super(props);
        this.addVideo = this.addVideo.bind(this);
        this.removeVideo = this.removeVideo.bind(this);
        this.readyToCall = this.readyToCall.bind(this);
        this.disconnect = this.disconnect.bind(this);
    }
    componentWillUnmount() {
        this.disconnect();
    }
    componentWillReceiveProps(nextProps) {
        let { alertReducer: { error } } = nextProps;
        if (!shallowEqual(this.props.alertReducer.error, error) && !!error) {
            this.props.onError(error);
        }
        if (!error && this.props.alertReducer.error) {
            this.props.history.goBack();
        }
    }
    componentDidMount() {
        let self = this;
        let { stalkReducer } = this.props;
        this.webrtc = new SimpleWebRTC({
            localVideoEl: ReactDOM.findDOMNode(this.refs.local),
            remoteVideosEl: "",
            autoRequestMedia: true,
            enableDataChannels: false,
            url: signalingServer,
            socketio: { 'force new connection': true },
            debug: false
        });
        this.webrtc.on('connectionReady', function (sessionId) {
            console.log("connectionReady", sessionId);
        });
        this.webrtc.on("leftRoom", (roomName) => {
            console.log("leftRoom", roomName);
        });
        this.webrtc.on("createdPeer", peer => {
            console.log("createdPeer", peer);
        });
        this.webrtc.on('videoAdded', this.addVideo);
        this.webrtc.on('videoRemoved', this.removeVideo);
        this.webrtc.on('readyToCall', this.readyToCall);
        // local p2p/ice failure
        this.webrtc.on('iceFailed', function (peer) {
            console.warn("iceFailed", peer);
            let connstate = document.querySelector('#container_' + self.webrtc.getDomId(peer) + ' .connectionstate');
            console.log('local fail', connstate);
            if (connstate) {
                connstate.innerText = 'Connection failed.';
                // fileinput.disabled = 'disabled';
            }
        });
        // remote p2p/ice failure
        this.webrtc.on('connectivityError', function (peer) {
            console.warn("connectivityError", peer);
            let connstate = document.querySelector('#container_' + self.webrtc.getDomId(peer) + ' .connectionstate');
            console.log('remote fail', connstate);
            if (connstate) {
                connstate.innerText = 'Connection failed.';
                // fileinput.disabled = 'disabled';
            }
        });
    }
    addVideo(video, peer) {
        //  console.log(this.refs.remotes);
        let remotes = ReactDOM.findDOMNode(this.refs.remotes);
        // console.log(remotes);
        if (remotes) {
            let container = document.createElement('div');
            container.className = 'videoContainer';
            container.id = 'container_' + this.webrtc.getDomId(peer);
            container.appendChild(video);
            // suppress contextmenu
            video.oncontextmenu = function () {
                return false;
            };
            remotes.appendChild(container);
            // show the ice connection state
            if (peer && peer.pc) {
                let connstate = document.createElement('div');
                connstate.className = 'connectionstate';
                container.appendChild(connstate);
                peer.pc.on('iceConnectionStateChange', function (event) {
                    switch (peer.pc.iceConnectionState) {
                        case 'checking':
                            connstate.innerText = 'Connecting to peer...';
                            break;
                        case 'connected':
                            connstate.innerText = 'connected...';
                            break;
                        case 'completed':// on caller side
                            connstate.innerText = 'Connection established.';
                            break;
                        case 'disconnected':
                            connstate.innerText = 'Disconnected.';
                            break;
                        case 'failed':
                            break;
                        case 'closed':
                            connstate.innerText = 'Connection closed.';
                            break;
                    }
                });
            }
        }
        else {
            console.warn("can't find remotes dom!");
        }
    }
    removeVideo(video, peer) {
        let remotes = ReactDOM.findDOMNode(this.refs.remotes);
        let el = document.getElementById(peer ? 'container_' + this.webrtc.getDomId(peer) : 'localScreenContainer');
        if (remotes && el) {
            remotes.removeChild(el);
        }
    }
    readyToCall() {
        let self = this;
        let { match, userReducer: { user }, stalkReducer } = this.props;
        let incommingCall = stalkReducer.get("incommingCall");
        if (!!incommingCall) {
            this.webrtc.joinRoom(incommingCall.room_id, () => {
                self.props.dispatch(calling.onCalling(incommingCall.room_id));
            });
        }
        else {
            let room_id = match.params.id;
            this.webrtc.joinRoom(room_id, () => {
                self.props.dispatch(calling.onCalling(room_id));
            });
            let room = chatroom.getRoom(room_id);
            let targets = new Array();
            room.members.map(value => {
                if (value._id != user._id) {
                    targets.push(value._id);
                }
            });
            this.props.dispatch(calling.videoCallRequest({ target_ids: targets, user_id: user._id, room_id: match.params.id }));
        }
    }
    disconnect() {
        this.webrtc.leaveRoom();
        this.webrtc.disconnect();
        this.props.dispatch(calling.onVideoCallEnded());
        let { match, userReducer: { user }, stalkReducer } = this.props;
        let room_id = match.params.id;
        let room = chatroom.getRoom(room_id);
        let targets = new Array();
        room.members.map(value => {
            if (value._id != user._id) {
                targets.push(value._id);
            }
        });
        this.props.dispatch(calling.hangupCallRequest({ target_ids: targets, user_id: user._id }));
    }
    render() {
        return (<Flexbox flexDirection="column" justifyContent={"flex-start"}>
                <Flexbox flexDirection="row" height="150px" justifyContent={"flex-start"}>
                    <video style={{ width: "150px" }} className="local" id="localVideo" ref="local">
                    </video>
                    <video style={{ width: "150px" }} className="remotes" id="remoteVideos" ref="remotes">
                    </video>
                    <video style={{ width: "150px" }} className="remotes" id="remoteVideos" ref="remotes">
                    </video>
                    <video style={{ width: "150px" }} className="remotes" id="remoteVideos" ref="remotes">
                    </video>
                </Flexbox>
                <div style={{ width: "100%" }} className="remotes" id="remoteVideos" ref="remotes">
                </div>
            </Flexbox>);
    }
}
const mapStateToProps = (state) => ({
    userReducer: state.userReducer,
    alertReducer: state.alertReducer,
    stalkReducer: state.stalkReducer
});
export var WebRtcPage = connect(mapStateToProps)(WebRtc);
WebRtcPage = withRouter(WebRtcPage);
