export function createStreamByText(text, mute = false) {
    let canvas = document.createElement('canvas');
    let width = 300;
    let height = 300;
    canvas.width = width;
    canvas.height = height;
    let context = canvas.getContext('2d');
    if (!!context) {
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillStyle = "#FFF";
        context.font = "45px Roboto";
        context.fillText(text, (width / 2), (height / 2));
    }
    let stream = canvas.captureStream(0);
    return stream;
}
export function createDummyStream() {
    let canvas = document.createElement('canvas');
    let width = 300;
    let height = 300;
    canvas.width = width;
    canvas.height = height;
    let context = canvas.getContext('2d');
    if (!!context) {
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.fillStyle = "#FFF";
        context.font = "45px Roboto";
        context.fillText("DUMMY", (width / 2), (height / 2));
    }
    let dummyStream = canvas.captureStream(0);
    dummyStream.type = "dummy";
    return dummyStream;
}
