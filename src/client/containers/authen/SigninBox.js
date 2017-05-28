var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
import * as React from "react";
import { SigninForm } from "../../components/SigninForm";
import * as CryptoHelper from "../../chitchat/chats/utils/CryptoHelper";
import * as AuthRx from "../../redux/authen/authRx";
;
;
export class SigninBox extends React.Component {
    componentWillMount() {
        this.state = {
            username: "",
            password: ""
        };
        this.onUsername = this.onUsername.bind(this);
        this.onPassword = this.onPassword.bind(this);
        this.onSubmitForm = this.onSubmitForm.bind(this);
    }
    onUsername(event, text) {
        this.setState(previous => (__assign({}, previous, { username: text })));
    }
    onPassword(event, text) {
        this.setState(previous => (__assign({}, previous, { password: text })));
    }
    onSubmitForm() {
        let username = this.state.username;
        let password = this.state.password;
        this.setState({ username: "", password: "" });
        if (username.length > 0 && password.length > 0) {
            CryptoHelper.hashComputation(password).then((hash) => {
                this.props.dispatch(AuthRx.authUser({ email: username, password: hash }));
            });
        }
        else {
            console.error("Require fields is missing!");
            this.props.onError("Require fields is missing!");
        }
    }
    render() {
        return (React.createElement("div", null,
            React.createElement(SigninForm, { username: this.state.username, onUsername: this.onUsername, password: this.state.password, onPassword: this.onPassword, onSubmit: this.onSubmitForm })));
    }
}
