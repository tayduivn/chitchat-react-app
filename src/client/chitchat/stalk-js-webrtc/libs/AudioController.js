import AudioCtx from './audioCtx';
export class AudioController {
    constructor(stream) {
        this.support = (!!(AudioContext && AudioContext.prototype.createMediaStreamSource)
            &&
                !!(MediaStream && MediaStream.prototype.removeTrack));
        this.volume = 1;
        if (this.support) {
            let context = AudioCtx.getInstance();
            this.microphone = context.createMediaStreamSource(stream);
            this.gainFilter = context.createGain();
            let destination = context.createMediaStreamDestination();
            let outputStream = destination.stream;
            this.microphone.connect(this.gainFilter);
            this.gainFilter.connect(destination);
            stream.addTrack(outputStream.getAudioTracks()[0]);
            this.audioSource = stream.getAudioTracks()[0];
            stream.removeTrack(this.audioSource);
        }
        else {
            console.log("Browser doesn't support adjust local microphone volume");
        }
    }
    setVolume(volume) {
        if (!this.support)
            return;
        this.gainFilter.gain.value = volume;
        this.volume = volume;
    }
    getVolume() {
        return this.volume;
    }
    mute() {
        this.setVolume(0);
    }
    unMute() {
        this.setVolume(1);
    }
    removeAudioStream() {
        !!this.audioSource && this.audioSource.stop();
        !!this.microphone && this.microphone.disconnect();
        !!this.gainFilter && this.gainFilter.disconnect();
    }
}
