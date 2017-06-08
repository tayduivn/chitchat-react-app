﻿import * as React from "react";
import { connect } from "react-redux";
import { shallowEqual } from "recompose";
import { Flex, Box } from "reflexbox";

import MuiThemeProvider from "material-ui/styles/MuiThemeProvider";
import * as Colors from "material-ui/styles/colors";
import Subheader from "material-ui/Subheader";

import { IComponentProps } from "../utils/IComponentProps";

import * as chatlogsActions from "../chitchat/chats/redux/chatlogs/chatlogsActions";
import * as AuthRx from "../redux/authen/authRx";
import * as AppActions from "../redux/app/persistentDataActions";

import { SimpleToolbar } from "../components/SimpleToolbar";
import { AuthenBox } from "./authen/AuthenBox";

interface IComponentNameState {
    alert: boolean;
}

class Home extends React.Component<IComponentProps, IComponentNameState> {
    clientWidth = document.documentElement.clientWidth;
    clientHeight = document.documentElement.clientHeight;
    headerHeight = 56;
    subHeaderHeight = null;
    bodyHeight = null;
    footerHeight = 24;
    alertTitle: string;
    alertMessage: string;

    onForgotAccount() {
        this.props.history.push("/forgotaccount");
    }

    componentWillMount() {
        console.log("Home", global.userAgent, this.props);

        this.state = {
            alert: false
        };
        this.headerHeight = 56;
        this.footerHeight = 24;
        this.clientHeight = document.documentElement.clientHeight;
        this.bodyHeight = (this.clientHeight - (this.headerHeight + this.subHeaderHeight + this.footerHeight));

        this.props.dispatch(AppActions.getSession());

        this.onForgotAccount = this.onForgotAccount.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        let { userReducer, authReducer, alertReducer
        } = nextProps as IComponentProps;

        let toolbar = document.getElementById("toolbar");
        let warning_bar = document.getElementById("warning_bar");
        let app_body = document.getElementById("app_body");
        let app_footer = document.getElementById("app_footer");

        this.subHeaderHeight = (warning_bar) ? warning_bar.clientHeight : 0;

        if (!shallowEqual(authReducer, this.props.authReducer)) {
            switch (authReducer.state) {
                case AuthRx.AUTH_USER_SUCCESS: {
                    AppActions.saveSession();
                    break;
                }
                case AuthRx.AUTH_USER_FAILURE: {
                    this.alertTitle = AuthRx.AUTH_USER_FAILURE;
                    this.alertMessage = authReducer.error;
                    this.setState(previous => ({ ...previous, alert: true }));
                    break;
                }
                case AppActions.GET_SESSION_TOKEN_SUCCESS: {
                    if (authReducer.state !== this.props.authReducer.state)
                        this.props.dispatch(AuthRx.tokenAuthUser(authReducer.token));
                    break;
                }
                default:
                    break;
            }
        }

        if (!shallowEqual(userReducer.user, this.props.userReducer.user)) {
            if (userReducer.user) {
                this.props.history.replace(`/team/${authReducer.user}`);
            }
        }

        if (alertReducer.error) {
            this.props.onError(alertReducer.error);
        }
    }

    public render(): JSX.Element {
        return (
            <div style={{ overflow: "hidden" }}>
                <div id={"toolbar"} style={{ height: this.headerHeight }}>
                    <SimpleToolbar title={"ChitChat team communication."} />
                </div>
                <div id={"app_body"} style={{ backgroundColor: Colors.indigo50, height: this.bodyHeight }}>
                    <Flex flexColumn={true} >
                        <Flex align="center">
                            <Box p={2} flexAuto></Box>
                            <AuthenBox {...this.props} onError={this.props.onError} />
                            <Box p={2} flexAuto></Box>
                        </Flex>
                        <Flex align="center">
                            <Box p={2} flexAuto></Box>
                            <button onClick={this.onForgotAccount}><b>Forgotten account.</b></button>
                            <Box p={2} flexAuto></Box>
                        </Flex>
                        <Box flexAuto justify="flex-end"></Box>
                    </Flex>
                </div>
                <div id={"app_footer"} style={{
                    width: this.clientWidth, height: this.footerHeight,
                    fontSize: 16, textAlign: "center", backgroundColor: Colors.indigo50
                }}>
                    <Flex px={2} align="center" justify="center">
                        <span>Powered by Stalk realtime communication API.</span>
                    </Flex>
                </div>
            </div>
        );
    }
}

/**
 * ## Redux boilerplate
 */
const mapStateToProps = (state) => ({ ...state });
export const HomeWithState = connect(mapStateToProps)(Home);
