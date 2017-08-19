import { CallingEvents } from "stalk-js";
import { BackendFactory } from "../../";
import * as callingActions from "../../../calling/";
export function stalkCallingInit() {
    const callingDataListener = BackendFactory.getInstance().callingDataListener;
    callingDataListener.addOnCallListener(onCall_handler);
}
function onCall_handler(dataEvent) {
    let call = dataEvent;
    console.log(`onCall_handler :`, call);
    switch (call.event) {
        case CallingEvents.VideoCall:
            callingActions.onVideoCall(call.payload);
            break;
        case CallingEvents.VoiceCall:
            break;
        case CallingEvents.HangupCall:
            callingActions.onHangupCall(call.payload);
            break;
        case CallingEvents.TheLineIsBusy:
            break;
        default:
            break;
    }
}