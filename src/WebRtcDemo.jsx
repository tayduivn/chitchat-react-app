import * as React from "react";
import { WebRtc } from "./WebRtc";
export class WebRtcDemo extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        let object = {
            roomname: "jsfiddletest",
            /*provide a valid url for signalmaster otherwise this won't work*/
            signalmasterUrl: "example.com"
        };
        return (<div>
                <WebRtc obj={object}/>
            </div>);
    }
}