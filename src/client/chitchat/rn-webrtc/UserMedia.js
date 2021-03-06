var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Platform } from 'react-native';
import { MediaStreamTrack, getUserMedia, } from 'react-native-webrtc';
export class UserMedia {
    constructor(options) {
        this.debug = false;
        this.debug = options.debug;
    }
    getLocalStream() {
        return this.localStream;
    }
    startLocalStream(mediaConstraints, isFront) {
        return __awaiter(this, void 0, void 0, function* () {
            let self = this;
            let videoSourceId;
            let defaultMediaConstraints = {
                audio: true,
                video: {
                    mandatory: {
                        minWidth: 640,
                        minHeight: 360,
                        minFrameRate: 30,
                    }
                }
            };
            if (Platform.OS === 'ios') {
                if (mediaConstraints.video) {
                    try {
                        videoSourceId = yield new Promise((resolve, reject) => {
                            MediaStreamTrack.getSources(sourceInfos => {
                                for (var i = 0; i < sourceInfos.length; i++) {
                                    const sourceInfo = sourceInfos[i];
                                    if (sourceInfo.kind == "video" && sourceInfo.facing == (isFront ? "front" : "back")) {
                                        videoSourceId = sourceInfo.id;
                                        resolve(videoSourceId);
                                    }
                                }
                            });
                        });
                    }
                    catch (ex) {
                        console.warn("Platform", ex);
                    }
                }
            }
            defaultMediaConstraints = Object.assign({}, mediaConstraints, { video: {
                    facingMode: (isFront ? "user" : "environment"),
                    optional: (videoSourceId ? [{ sourceId: videoSourceId }] : [])
                } });
            return new Promise((resolve, reject) => {
                getUserMedia(defaultMediaConstraints, function (stream) {
                    console.log('getUserMedia success');
                    let videoTracks = stream.getVideoTracks();
                    let audioTracks = stream.getAudioTracks();
                    if (videoTracks.length > 0) {
                        console.log('Using video device: ' + videoTracks[0].label);
                    }
                    if (audioTracks.length > 0) {
                        console.log('Using audio device: ' + audioTracks[0].label);
                    }
                    stream.oninactive = function () {
                        console.log('Stream inactive');
                    };
                    stream.onactive = () => {
                        console.log('Local Stream active');
                    };
                    self.localStream = stream;
                    resolve(self.localStream);
                }, error => {
                    if (error.name === 'ConstraintNotSatisfiedError') {
                        reject('The resolution  is not supported by your device.');
                    }
                    else if (error.name === 'PermissionDeniedError') {
                        reject('Permissions have not been granted to use your camera and ' +
                            'microphone, you need to allow the page access to your devices in ' +
                            'order for the demo to work.');
                    }
                    else {
                        reject('getUserMedia error: ' + error.name);
                    }
                });
            });
        });
    }
    stopLocalStream() {
        this.stopStream();
    }
    stopStream() {
        let self = this;
        let tracks = this.localStream.getTracks();
        tracks.forEach(function (track) {
            track.stop();
        });
    }
}
