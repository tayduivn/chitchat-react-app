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
const ContactProfile_1 = require("./ContactProfile");
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
    }
    onSelectMember(item) {
        this.setState(previous => (__assign({}, previous, { member: item })));
    }
    onSubmit() {
        let { adminReducer: { orgCharts } } = this.props;
        let _member = this.state.member;
        _member.org_chart_id = orgCharts[this.state.dropdownValue]._id;
        if (_member) {
            console.log(_member);
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
                React.createElement(ContactProfile_1.ContactProfile, { member: this.state.member, onSubmit: this.onSubmit, dropdownItems: this.props.adminReducer.orgCharts, dropdownValue: this.state.dropdownValue, dropdownChange: (event, id, value) => { this.setState(previous => (__assign({}, previous, { dropdownValue: value }))); } })
                :
                    React.createElement(MemberList_1.MemberList, { onSelected: this.onSelectMember, value: this.props.teamReducer.members })),
            React.createElement(reflexbox_1.Box, { p: 2, flexAuto: true })));
    }
}
exports.TeamMemberBox = TeamMemberBox;