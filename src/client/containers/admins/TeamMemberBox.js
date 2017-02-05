"use strict";
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
const React = require("react");
const reflexbox_1 = require("reflexbox");
const MemberList_1 = require("../chatlist/MemberList");
const ContactProfileView_1 = require("./ContactProfileView");
const adminRx = require("../../redux/admin/adminRx");
;
class TeamMemberBox extends React.Component {
    componentWillMount() {
        this.state = {
            member: null,
            dropdownValue: 0
        };
        this.onSelectMember = this.onSelectMember.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
    }
    componentWillReceiveProps(nextProps) {
        let { adminReducer } = nextProps;
        switch (adminReducer.state) {
            case adminRx.UPDATE_USER_ORG_CHART_SUCCESS:
                this.setState(previous => (__assign({}, previous, { member: null })));
                break;
            default:
                break;
        }
    }
    onSelectMember(item) {
        let { adminReducer: { orgCharts } } = this.props;
        if (!item.org_chart_id) {
            this.setState(previous => (__assign({}, previous, { member: item, dropdownValue: -1 })));
        }
        else {
            let charts = orgCharts;
            let chart_ids = charts.findIndex((v, i, arr) => {
                return v._id.toString() === item.org_chart_id;
            });
            this.setState(previous => (__assign({}, previous, { member: item, dropdownValue: chart_ids })));
        }
    }
    onSubmit() {
        let { adminReducer: { orgCharts } } = this.props;
        let _member = this.state.member;
        if (orgCharts.length > 0) {
            _member.org_chart_id = orgCharts[this.state.dropdownValue]._id;
        }
        if (_member) {
            this.props.dispatch(adminRx.updateUserOrgChart(_member));
        }
        else {
            if (this.props.onError) {
                this.props.onError("WTF");
            }
        }
    }
    render() {
        return (React.createElement(reflexbox_1.Flex, { flexColumn: false },
            React.createElement(reflexbox_1.Box, { p: 2, flexAuto: true }),
            React.createElement(reflexbox_1.Flex, { flexColumn: true, align: "center" }, (!!this.state.member) ?
                React.createElement(ContactProfileView_1.ContactProfileView, { member: this.state.member, onSubmit: this.onSubmit, dropdownItems: this.props.adminReducer.orgCharts, dropdownValue: this.state.dropdownValue, dropdownChange: (event, id, value) => { this.setState(previous => (__assign({}, previous, { dropdownValue: value }))); } })
                :
                    React.createElement(MemberList_1.MemberList, { onSelected: this.onSelectMember, value: this.props.teamReducer.members })),
            React.createElement(reflexbox_1.Box, { p: 2, flexAuto: true })));
    }
}
exports.TeamMemberBox = TeamMemberBox;
