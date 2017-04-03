"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const react_redux_1 = require("react-redux");
const MuiThemeProvider_1 = require("material-ui/styles/MuiThemeProvider");
const SimpleToolbar_1 = require("../components/SimpleToolbar");
const ProfileBox_1 = require("./profile/ProfileBox");
const ConnectGroupListEnhancer_1 = require("./group/ConnectGroupListEnhancer");
const ChatLogsBox_1 = require("./chatlog/ChatLogsBox");
const ContactBox_1 = require("./chatlist/ContactBox");
const SnackbarToolBox_1 = require("./toolsbox/SnackbarToolBox");
const StalkComponent_1 = require("./stalk/StalkComponent");
const StalkBridgeActions = require("../chats/redux/stalkBridge/stalkBridgeActions");
const chatroomActions = require("../chats/redux/chatroom/chatroomActions");
const chatlogsActions = require("../chats/redux/chatlogs/chatlogsActions");
const chatroomRx = require("../chats/redux/chatroom/chatroomRxEpic");
const userRx = require("../redux/user/userRx");
const authRx = require("../redux/authen/authRx");
const groupRx = require("../redux/group/groupRx");
const privateGroupRxActions = require("../redux/group/privateGroupRxActions");
;
class Main extends React.Component {
    constructor() {
        super(...arguments);
        this.menus = ["menu", "log out"];
        this.clientWidth = document.documentElement.clientWidth;
        this.clientHeight = document.documentElement.clientHeight;
        this.headerHeight = null;
        this.subHeaderHeight = null;
        this.bodyHeight = null;
        this.fetch_privateChatRoom = (roommateId, owerId) => {
            this.props.dispatch(chatroomRx.fetchPrivateChatRoom(owerId, roommateId));
        };
        this.fetch_orgGroups = () => {
            this.props.dispatch(groupRx.getOrgGroup(this.props.teamReducer.team._id));
        };
        this.fetch_privateGroups = () => {
            this.props.dispatch(privateGroupRxActions.getPrivateGroup(this.props.teamReducer.team._id));
        };
    }
    componentWillMount() {
        this.state = {
            header: "Home"
        };
        const { teamReducer, stalkReducer, chatlogReducer } = this.props;
        if (!teamReducer.team) {
            this.props.router.replace("/");
        }
        else if (teamReducer.team &&
            stalkReducer.state == StalkBridgeActions.STALK_INIT_SUCCESS
            && chatlogReducer.state == chatlogsActions.STALK_INIT_CHATSLOG) {
            this.props.dispatch(chatlogsActions.getLastAccessRoom(teamReducer.team._id));
        }
        this.onSelectMenuItem = this.onSelectMenuItem.bind(this);
        this.fetch_orgGroups = this.fetch_orgGroups.bind(this);
        this.fetch_privateGroups = this.fetch_privateGroups.bind(this);
    }
    componentWillReceiveProps(nextProps) {
        let { location: { query: { userId, username, roomId, contactId } }, userReducer, stalkReducer, chatroomReducer, teamReducer, chatlogReducer } = nextProps;
        let warning_bar = document.getElementById("warning_bar");
        this.headerHeight = document.getElementById("toolbar").clientHeight;
        this.subHeaderHeight = (warning_bar) ? warning_bar.clientHeight : 0;
        this.bodyHeight = (this.clientHeight - (this.headerHeight + this.subHeaderHeight));
        switch (userReducer.state) {
            case userRx.FETCH_AGENT_SUCCESS:
                this.joinChatServer(nextProps);
                break;
            default:
                if (!userReducer.user) {
                    this.props.router.push("/");
                }
                break;
        }
        switch (stalkReducer.state) {
            case StalkBridgeActions.STALK_INIT_SUCCESS:
                if (this.props.stalkReducer.state !== StalkBridgeActions.STALK_INIT_SUCCESS) {
                    if (contactId) {
                        this.fetch_privateChatRoom(contactId, userReducer.user._id);
                    }
                    else if (userReducer.contact) {
                        this.fetch_privateChatRoom(userReducer.contact._id, userReducer.user._id);
                    }
                }
                break;
            default:
                break;
        }
        switch (chatroomReducer.state) {
            case chatroomActions.GET_PERSISTEND_CHATROOM_SUCCESS: {
                this.props.router.push(`/chat/${chatroomReducer.room._id}`);
                break;
            }
            case chatroomActions.GET_PERSISTEND_CHATROOM_FAILURE: {
                console.warn("GET_PERSISTEND_CHATROOM_FAILURE");
                break;
            }
            default:
                break;
        }
    }
    joinChatServer(nextProps) {
        let { stalkReducer, userReducer } = nextProps;
        if (userReducer.user) {
            if (stalkReducer.state !== StalkBridgeActions.STALK_INIT) {
                StalkBridgeActions.stalkLogin(userReducer.user);
            }
        }
    }
    onSelectMenuItem(id, value) {
        console.log(this.menus[id]);
        let { authReducer } = this.props;
        switch (id) {
            case 0:
                this.props.router.push(`/admin/${authReducer.user}`);
                break;
            case 1:
                this.props.dispatch(authRx.logout(this.props.authReducer.token));
                break;
            default:
                break;
        }
    }
    render() {
        return (React.createElement(MuiThemeProvider_1.default, null,
            React.createElement("div", { style: { overflowY: "hidden" } },
                React.createElement("div", { style: { height: this.headerHeight }, id: "toolbar" },
                    React.createElement(SimpleToolbar_1.SimpleToolbar, { title: this.props.teamReducer.team.name, menus: this.menus, onSelectedMenuItem: this.onSelectMenuItem })),
                React.createElement("div", { style: { height: this.bodyHeight, overflowY: "auto" }, id: "app_body" },
                    React.createElement(ProfileBox_1.ConnectProfileEnhancer, { router: this.props.router }),
                    React.createElement(ConnectGroupListEnhancer_1.ConnectGroupListEnhancer, { fetchGroup: () => this.fetch_orgGroups(), groups: this.props.groupReducer.orgGroups, subHeader: "OrgGroups" }),
                    React.createElement(ConnectGroupListEnhancer_1.ConnectGroupListEnhancer, { fetchGroup: () => { this.fetch_privateGroups(); }, groups: this.props.groupReducer.privateGroups, subHeader: "Groups" }),
                    React.createElement(ContactBox_1.default, Object.assign({}, this.props)),
                    React.createElement(ChatLogsBox_1.ChatLogsBoxEnhancer, { router: this.props.router }),
                    React.createElement(SnackbarToolBox_1.SnackbarToolBox, null),
                    React.createElement(StalkComponent_1.StalkCompEnhancer, null)))));
    }
}
const mapStateToProps = (state) => (Object.assign({}, state));
exports.default = react_redux_1.connect(mapStateToProps)(Main);