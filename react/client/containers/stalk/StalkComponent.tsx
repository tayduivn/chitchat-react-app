import * as React from "react";
import { connect } from "react-redux";
import { Flex, Box } from "reflexbox";
import MuiThemeProvider from "material-ui/styles/MuiThemeProvider";
import * as Colors from "material-ui/styles/colors";

import { WarningBar } from "../../components/WarningBar";
import { LinearProgressDialog } from "../../components/LinearProgressDialog";

import { IComponentProps } from "../../utils/IComponentProps";

import * as StalkBridgeActions from "../../chats/redux/stalkBridge/stalkBridgeActions";
import * as chatroomActions from "../../chats/redux/chatroom/chatroomActions";
import * as chatroomRx from "../../chats/redux/chatroom/chatroomRxEpic";

abstract class IStalktProps implements IComponentProps {
    footerHeight;
    userReducer;
    stalkReducer;
    dispatch;
}

class StalkComponent extends React.Component<IStalktProps, any> {
    render() {
        return (
            <div>
                {
                    (this.props.stalkReducer.state === StalkBridgeActions.STALK_INIT_FAILURE ||
                        this.props.stalkReducer.state === StalkBridgeActions.STALK_CONNECTION_PROBLEM) ?
                        <WarningBar /> : null
                }
                {
                    (this.props.stalkReducer.state === StalkBridgeActions.STALK_INIT) ?
                        <LinearProgressDialog title={"Joining... stalk service"}
                            open={true}
                            handleClose={() => { }} /> : null
                }
            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    stalkReducer: state.stalkReducer,
    userReducer: state.userReducer
});
export const StalkCompEnhancer = connect(mapStateToProps)(StalkComponent);