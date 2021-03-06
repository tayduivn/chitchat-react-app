import * as React from "react";
import * as Colors from "material-ui/styles/colors";
import FlatButton from 'material-ui/FlatButton';
import FontIcon from 'material-ui/FontIcon';
import Flexbox from "flexbox-react";
import Subheader from 'material-ui/Subheader';
import Avatar from 'material-ui/Avatar';
import * as chatroomActions from "../chitchat/chats/redux/chatroom/chatroomActions";
import { groups } from "../chitchat/consts/AlertMsg";
import { RoomType } from "../chitchat/chats/models/Room";
import { UserRole } from "../chitchat/chats/models/UserRole";
import { connect } from "react-redux";
import { compose, pure, withHandlers } from "recompose";
import { withRouter } from "react-router-dom";
const checkAdminPermission = (teamProfile) => {
    let { team_role } = teamProfile;
    if (team_role.toString() == UserRole[UserRole.admin]) {
        return true;
    }
    else
        return false;
};
const getView = (props) => {
    let { match, history, onError, chatroomReducer, userReducer } = props;
    let { room_id } = match.params;
    let { room } = chatroomReducer;
    if (room_id && !room) {
        room = chatroomActions.getRoom(room_id);
    }
    if (match.path.match("/chatroom/") && room) {
        return (<div style={{ margin: 2, backgroundColor: Colors.blueGrey50 }}>
                <Flexbox flexDirection="row">
                    <Avatar src={(room.image) ? room.image : (room.name) ? room.name.charAt(0) : null} style={{ margin: 2 }}/>
                    <Subheader style={{ color: Colors.indigo500 }}>{(room.name) ? room.name.toUpperCase() : null}</Subheader>

                    {(room.type != RoomType.privateChat) ? (<Flexbox flexDirection="row">
                                <FlatButton label="Manage Group" style={{ margin: 2 }} onClick={() => {
            if (room.type == RoomType.organizationGroup) {
                if (checkAdminPermission(userReducer.teamProfile)) {
                    history.push(`/chatroom/settings/${room_id}/add_member`);
                }
                else {
                    onError(groups.request_admin_permission);
                }
            }
            else {
                history.push(`/chatroom/settings/${room_id}/add_member`);
            }
        }}/>
                                <FlatButton label="Edit Group Settings" style={{ margin: 2 }} onClick={() => {
            if (room.type == RoomType.organizationGroup) {
                if (checkAdminPermission(userReducer.teamProfile)) {
                    history.push(`/chatroom/settings/${room_id}/edit`);
                }
                else {
                    onError(groups.request_admin_permission);
                }
            }
            else {
                history.push(`/chatroom/settings/${room_id}/edit`);
            }
        }}/>
                            </Flexbox>) : (<Flexbox flexDirection="row" alignItems={"center"}>
                                    <FontIcon className="material-icons" style={{ marginRight: 24, fontSize: 48, cursor: 'pointer' }} color={Colors.lightGreen500} onClick={props.onVideoCall}>
                                        video_call
                                        </FontIcon>
                                    <FontIcon className="material-icons" style={{ marginRight: 24, fontSize: 36, cursor: 'pointer' }} color={Colors.lightGreen500} onClick={props.onAudioCall}>
                                        call
                                        </FontIcon>
                                </Flexbox>)}
                </Flexbox>
            </div>);
    }
};
export const SubToolbar = (props) => (<div>
        {getView(props)}
    </div>);
const mapStateToProps = (state) => ({
    chatroomReducer: state.chatroomReducer,
    userReducer: state.userReducer
});
const SubToolbarEnhancer = compose(withRouter, connect(mapStateToProps), withHandlers({
    onVideoCall: (props) => event => {
        props.history.push(`/videocall/${props.match.params.room_id}`);
    },
    onAudioCall: (props) => event => {
        props.history.push(`/audiocall/${props.match.params.room_id}`);
    },
}), pure);
export const SubToolbarEnhance = SubToolbarEnhancer(({ history, match, onError, chatroomReducer, userReducer, onVideoCall, onAudioCall }) => (<SubToolbar onError={onError} onVideoCall={onVideoCall} onAudioCall={onAudioCall} history={history} match={match} chatroomReducer={chatroomReducer} userReducer={userReducer}/>));
