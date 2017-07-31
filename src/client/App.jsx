import * as React from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import { ApolloProvider } from 'react-apollo';
import Store from "./redux/configureStore";
import { apolloClient } from "./redux/rootReducer";
import { chitchatFactory, config } from "./Chitchat";
chitchatFactory.initConfig(config);
chitchatFactory.initStore(Store);
chitchatFactory.initSecureService();
Store.subscribe(() => {
    chitchatFactory.setAuthStore(Store.getState().userReducer.user, Store.getState().authReducer.token);
    chitchatFactory.setTeamStore({
        team: Store.getState().teamReducer.team,
        members: Store.getState().teamReducer.members
    });
});
import { ReapopNotiBoxWithState } from "./components/NotificationSystem";
import { StalkNotiDialog } from "./containers/stalk/StalkNotiDialog";
import { StalkCompEnhancer } from "./containers/stalk/StalkComponent";
import { HomePageWithDialogBox } from "./containers/HomeEnhanced";
import { ForgotAccount } from "./containers/ForgottenAccount";
import { ChatPageEnhanced } from "./containers/ChatPageEnhanced";
import { ChatRoomSettingsEnhanced } from "./containers/ChatRoomSettingsPage";
import { TeamPageEnhanced } from "./containers/TeamPageEnhanced";
import { ProfilePageEnhanced } from "./containers/ProfilePageEnhanced";
import { MainPageWithDialogBox } from "./containers/Main";
import { M_MainPageEnhanced } from "./containers/m_Main";
import { AdminPageEnhanced } from "./containers/AdminPageEnhanced";
import { VideoCallEnhance } from "./containers/VideoCall";
import { SMALL_TABLET } from "./chitchat/consts/Breakpoints";
class App extends React.Component {
    constructor() {
        super(...arguments);
        this.clientWidth = document.documentElement.clientWidth;
    }
    render() {
        return (<ApolloProvider store={Store} client={apolloClient}>
                <Router>
                    <div id="app">
                        <ReapopNotiBoxWithState />
                        <StalkNotiDialog />
                        <StalkCompEnhancer />

                        <Route path="/" exact component={HomePageWithDialogBox}/>
                        <Route path="/forgotaccount" component={ForgotAccount}/>
                        <Route path="/team/:filter" component={TeamPageEnhanced}/>
                        <Route path="/profile/:filter/:user" component={(this.clientWidth < SMALL_TABLET) ? ProfilePageEnhanced : MainPageWithDialogBox}/>
                        <Route path="/chatslist/:filter" component={(this.clientWidth < SMALL_TABLET) ? M_MainPageEnhanced : MainPageWithDialogBox}/>
                        <Route path="/chatroom/chat/:room_id" component={(this.clientWidth < SMALL_TABLET) ? ChatPageEnhanced : MainPageWithDialogBox}/>
                        <Route path="/chatroom/settings/:room_id/:edit" component={(this.clientWidth < SMALL_TABLET) ? ChatRoomSettingsEnhanced : MainPageWithDialogBox}/>
                        <Route path="/admin/:menu?/:id?" component={AdminPageEnhanced}/>
                        <Route path="/videocall/:id" component={VideoCallEnhance}/>
                    </div>
                </Router>
            </ApolloProvider>);
    }
}
export default App;
