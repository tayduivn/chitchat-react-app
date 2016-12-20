import * as React from "react";
class RecentChatItem extends React.Component {
    constructor(props) {
        super(props);
    }
    componentDidMount() {
    }
    getAvatar() {
        {
            return this.props.data.room.image ?
                React.createElement(View, { style: { justifyContent: 'center', alignItems: 'center', flex: 1, } },
                    React.createElement(Avatar, { image: { uri: this.props.data.room.image }, size: height / 12, style: { alignSelf: "center", }, status: this.props.data.contact ? this.props.data.contact[0].online_status ? "online" : "offline" : "offline" }))
                :
                    React.createElement(View, { style: { justifyContent: 'center', alignItems: 'center', flex: 1, } },
                        React.createElement(Avatar, { name: this.props.data.room.name, size: height / 12, style: { alignSelf: "center", }, status: this.props.data.contact ? this.props.data.contact[0].online_status ? "online" : "offline" : "offline" }));
        }
    }
    getOtherId() {
        let otherId = "";
        if (!!this.props.data.room) {
            this.props.data.room.members.map((value) => {
                if (value.id != this.props.myId)
                    otherId = value.id;
            });
        }
        return otherId;
    }
    formatAMPM(date) {
        let hours = date.getHours();
        let minutes = date.getMinutes();
        let ampm = hours >= 12 ? 'pm' : 'am';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        minutes = minutes < 10 ? '0' + minutes : minutes;
        let strTime = hours + ':' + minutes + ' ' + ampm;
        return strTime;
    }
    getDate() {
        let day = ["Sunday", "Monday", "Tuesday", "Wednesday",
            "Thursday", "Friday", "Saturday"];
        let now = new Date();
        let date = new Date(this.props.data.lastMessageTime);
        let txtDate = "";
        if (now.getDate() == date.getDate() && now.getMonth() == date.getMonth() && now.getFullYear() == date.getFullYear()) {
            txtDate = this.formatAMPM(date);
        }
        else if (now.getDate() - 7 < date.getDate() && now.getMonth() == date.getMonth() && now.getFullYear() == date.getFullYear()) {
            txtDate = day[date.getDay()];
        }
        else {
            txtDate = date.getMonth() + 1 + '/' + date.getDate();
        }
        return txtDate;
    }
    getCount(num) {
        if (num == 0) {
            return null;
        }
        else
            return React.createElement(View, { style: { backgroundColor: '#f66a61', borderRadius: 12, width: 24, height: 24, justifyContent: 'center', alignItems: 'center', flex: 1 } },
                React.createElement(Text, { style: { color: 'white', fontSize: 12 } }, num));
    }
    render() {
        let otherId = this.getOtherId();
        return (React.createElement(TouchableOpacity, { style: { backgroundColor: 'white', width: width, height: height / 8, flexDirection: 'row', borderBottomWidth: 1, borderColor: '#ececec' }, onPress: () => { this.props.onPress(otherId); } },
            React.createElement(View, { style: { backgroundColor: 'white', flex: 1, flexDirection: 'row', borderBottomWidth: 1, borderColor: '#ececec' } },
                React.createElement(View, { style: { justifyContent: 'center', alignItems: 'center', marginHorizontal: 5, marginVertical: 12, marginLeft: 10 } }, this.getAvatar()),
                React.createElement(View, { style: { flex: 1, justifyContent: 'center', marginLeft: 10 } },
                    React.createElement(Text, { numberOfLines: 1, style: { fontSize: 14, color: 'black', fontWeight: 'bold', marginBottom: 8 } }, this.props.data.roomName),
                    React.createElement(Text, { numberOfLines: 1, style: { color: 'gray', fontWeight: '300', fontSize: 12 }, onPress: () => { } }, this.props.data.lastMessage)),
                React.createElement(View, { style: { justifyContent: 'center', alignItems: 'flex-end', marginHorizontal: 5, marginVertical: 12, flexDirection: 'column' } },
                    React.createElement(Text, { style: { color: 'gray', marginBottom: 8, fontWeight: '200', flex: 1, fontSize: 12 } }, this.getDate()),
                    React.createElement(View, { style: { flex: 1 } }, this.getCount(this.props.data.count))))));
    }
}
export default RecentChatItem;