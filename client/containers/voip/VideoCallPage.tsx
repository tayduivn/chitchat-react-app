import * as React from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { shallowEqual } from "recompose";
import Flexbox from "flexbox-react";

import MuiThemeProvider from "material-ui/styles/MuiThemeProvider";
import * as Colors from "material-ui/styles/colors";
import Subheader from "material-ui/Subheader";

import { IComponentProps } from "../../utils/IComponentProps";

import { SimpleToolbar } from "../../components/SimpleToolbar";
import { WebRtcPage } from "../webrtc/";

interface IComponentNameState {
}

class VideoCall extends React.Component<IComponentProps, IComponentNameState> {

    constructor(props) {
        super(props);

        this.onBackPressed = this.onBackPressed.bind(this);
        this.onTitlePressed = this.onTitlePressed.bind(this);
    }

    componentWillMount() {
        if (!this.props.teamReducer.team) {
            this.props.history.replace("/");
        }
    }

    componentWillReceiveProps(nextProps: IComponentProps) {
        let prevInline = this.props.stalkReducer.get("inline");
        let nextInline = nextProps.stalkReducer.get("inline");
        if (!nextInline && !shallowEqual(nextInline, prevInline)) {
            this.onBackPressed();
        }
    }

    onBackPressed() {
        // Jump to main menu.
        this.props.history.goBack();
    }
    onTitlePressed() {
        let { history, teamReducer } = this.props;
        history.replace(`/team/${teamReducer.team._id}`);
    }

    render(): JSX.Element {
        let { team } = this.props.teamReducer;
        return (
            <MuiThemeProvider>
                <Flexbox flexDirection="column" style={{ backgroundColor: Colors.blueGrey50 }}>
                    <div style={{ position: "relative", height: "56px" }}>
                        <div style={{ position: "fixed", width: "100%", zIndex: 1 }} >
                            <SimpleToolbar
                                title={(!!team) ? team.name.toUpperCase() : ""}
                                onBackPressed={this.onBackPressed}
                                onPressTitle={this.onTitlePressed} />
                        </div>
                    </div>
                    <Flexbox flexDirection="row" height="calc(100vh - 56px)">
                        <Flexbox minWidth="400px" justifyContent="center">
                        </Flexbox>
                        <Flexbox flexGrow={1} justifyContent="center">
                            <WebRtcPage onError={this.props.onError} />
                        </Flexbox>
                    </Flexbox>
                </Flexbox>
            </MuiThemeProvider >
        );
    }
}

const mapStateToProps = (state) => ({
    teamReducer: state.teamReducer,
    stalkReducer: state.stalkReducer
});
export var VideoCallPage = connect(mapStateToProps)(VideoCall) as React.ComponentClass<{ onError }>;
VideoCallPage = withRouter<any>(VideoCallPage);
