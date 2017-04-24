﻿import * as React from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router-dom";
import { shallowEqual } from "recompose";
import { Flex, Box } from "reflexbox";
import * as immutable from "immutable";
import MuiThemeProvider from "material-ui/styles/MuiThemeProvider";
import * as Colors from "material-ui/styles/colors";
import { ProfileEnhancer } from "./profile/ProfileBox";

import { SimpleToolbar } from "../components/SimpleToolbar";
import { ProfileWithRouter } from "./profile/ProfileBox";
import { ConnectGroupListEnhancer } from "./group/ConnectGroupListEnhancer";
import { ChatLogsBoxEnhancer } from "./chatlog/ChatLogsBox";
import { SnackbarToolBox } from "./toolsbox/SnackbarToolBox";
import { StalkCompEnhancer } from "./stalk/StalkComponent";
import { AppBody } from "./AppBody";
import { RightNav } from "./RightNav";
import { SubToolbar } from "./SubToolbar";
import { ConnectedAppBody } from "./AppBody";
import { ContactBox } from "./chatlist/ContactBox";

import { MainPageEnhancer } from "./Enhancers/MainPageEnhancer";
import { DialogBoxEnhancer } from "./toolsbox/DialogBoxEnhancer";
import { ToolbarEnhanced, listener } from "./MainPageToolbar";
import { DialogBox, IDialoxBoxProps } from "../components/DialogBox";

const MainPageEnhanced = MainPageEnhancer(({ teamReducer, groupReducer, authReducer, userReducer,
    history, match, onError, fetch_orgGroups, fetch_privateGroups }) => {

    // console.log(match, history.location);

    return (
        <MuiThemeProvider>
            <div>
                <div id={"app_body"} >
                        <Flex>
                            <Box col={12}>
                                 <ToolbarEnhanced history={history} teamReducer={teamReducer} authReducer={authReducer} listener={listener} />

                            </Box>
                          
                        </Flex>
                        <Flex >

                                <Box col={3} style={{overflowY: "scroll"}}>
                                        <ProfileWithRouter />
                                        <ConnectGroupListEnhancer
                                            fetchGroup={fetch_orgGroups}
                                            groups={groupReducer.orgGroups}
                                            subHeader={"OrgGroups"} />
                                        <ConnectGroupListEnhancer
                                            fetchGroup={fetch_privateGroups}
                                            groups={groupReducer.privateGroups}
                                            subHeader={"Groups"} />
                                        <ChatLogsBoxEnhancer router={history} />
                                        <SnackbarToolBox />
                                </Box>
                                <Box col={6} >
                                <SubToolbar match={match} onError={onError} />
                                    <AppBody userReducer={userReducer} match={match} onError={onError} />                               
                                </Box>
                                <Box col={3} >
                                        <RightNav match={match} onError={onError} />
                                    {/*<ContactBox {...this.props} />                                */}
                                </Box>
                        </Flex>
                </div>
                <div id={"app_footer"}>
                    <StalkCompEnhancer />
                </div>
            </div>
        </MuiThemeProvider >
    );
});

export let MainPageWithDialogBox = DialogBoxEnhancer(({ title, message, open, handleClose, onError,
    history, match }: any) =>
    <div>
        <MainPageEnhanced onError={onError} history={history} match={match} />
        <DialogBox
            title={title}
            message={message}
            open={open}
            handleClose={handleClose} />
    </div>
);

MainPageWithDialogBox = withRouter(MainPageWithDialogBox);