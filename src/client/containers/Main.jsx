import * as React from "react";
import { withRouter } from "react-router-dom";
import Flexbox from 'flexbox-react';
import * as Colors from "material-ui/styles/colors";
import { ConnectGroupListEnhancer } from "./group/ConnectGroupListEnhancer";
import { ChatLogsBoxEnhancer } from "./chatlog/ChatLogsBox";
import { AppBody } from "./AppBody";
import { RightNav } from "./RightNav";
import { SubToolbarEnhance } from "./SubToolbar";
import { WithDialog } from "./toolsbox/DialogBoxEnhancer";
import { MainPageEnhancer } from "./Enhancers/MainPageEnhancer";
import { WebToolbarEnhanced, listener } from "./MainPageToolbar";
import { ChatTabsEnhanced } from "./toolsbox/ChatTabsEnhance";
import { small_width, large_body_width, LARGE_TABLET, xsmall_width } from '../chitchat/consts/Breakpoints';
const styles = {
    chatTabs: {
        height: "calc(100vh - (56px + 60px))",
        overflowY: "auto"
    }
};
export const Main = ({ teamname, userReducer, authReducer, groupReducer, chatroomReducer, match, history, onError, fetch_orgGroups, fetch_privateGroups }) => {
    const _teamname = (teamname) ? teamname.toUpperCase() : "";
    const menus = ["Menu", `Sign out of ${_teamname}`];
    return (<Flexbox flexDirection="column" height="100vh">
            <Flexbox element="header" maxHeight="56px">
                <div id={"app_bar"} style={{ width: "100%", position: 'fixed', zIndex: 99 }}>
                    <WebToolbarEnhanced teamname={teamname} history={history} authReducer={authReducer} menus={menus} listener={listener}/>
                </div>
            </Flexbox>
            <Flexbox flexDirection="row" justifyContent="center" flexGrow={1} height="calc(100vh - 56px)" style={{ backgroundColor: Colors.blueGrey50, marginTop: "56px" }}>
                <Flexbox flexGrow={1}/>
                <Flexbox flexDirection="column" flexGrow={0.3} minWidth="280px" width={window.innerWidth >= LARGE_TABLET ? small_width : xsmall_width} style={{ overflowY: "hidden", backgroundColor: Colors.darkWhite }}>
                    <ChatTabsEnhanced groupComp={<div style={{ height: "calc(100vh - (56px + 60px))", overflowY: "auto" }}>
                                <ConnectGroupListEnhancer fetchGroup={fetch_orgGroups} groups={groupReducer.orgGroups} subHeader={"OrgGroups"}/>
                                <ConnectGroupListEnhancer fetchGroup={fetch_privateGroups} groups={groupReducer.privateGroups} subHeader={"Groups"}/>
                            </div>} chatlogs={<div style={{ height: "calc(100vh - (56px + 60px))", overflowY: "auto" }}>
                                <ChatLogsBoxEnhancer />
                            </div>}/>
                </Flexbox>
                <Flexbox flexDirection="column" flexGrow={0.7}>
                    <SubToolbarEnhance onError={onError}/>
                    <Flexbox height="calc(100vh - 56px)">
                        <Flexbox flexGrow={1}/>
                        <Flexbox width={window.innerWidth >= LARGE_TABLET ? large_body_width : small_width}>
                            <div style={{ width: "100%", backgroundColor: Colors.darkWhite }}>
                                <AppBody userReducer={userReducer} match={match} history={history} onError={onError}/>
                            </div>
                        </Flexbox>
                        <Flexbox flexGrow={1}/>
                        <Flexbox minWidth="280px" width={window.innerWidth >= LARGE_TABLET ? small_width : xsmall_width}>
                            <div style={{ width: "100%", backgroundColor: Colors.darkWhite, overflowY: "auto" }}>
                                <RightNav match={match} onError={onError}/>
                            </div>
                        </Flexbox>
                    </Flexbox>
                </Flexbox>
                <Flexbox flexGrow={1}/>
            </Flexbox>
        </Flexbox>);
};
const MainPageEnhanced = MainPageEnhancer(({ teamname, teamReducer, groupReducer, authReducer, userReducer, chatroomReducer, history, match, onError, fetch_orgGroups, fetch_privateGroups }) => {
    return (<Main teamname={teamname} userReducer={userReducer} authReducer={authReducer} groupReducer={groupReducer} chatroomReducer={chatroomReducer} match={match} history={history} onError={onError} fetch_orgGroups={fetch_orgGroups} fetch_privateGroups={fetch_privateGroups}/>);
});
export const MainPageWithDialog = WithDialog(withRouter(MainPageEnhanced));
