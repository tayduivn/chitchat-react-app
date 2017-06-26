import * as React from 'react';
import { SimpleToolbar } from "../components/SimpleToolbar";
import MuiThemeProvider from "material-ui/styles/MuiThemeProvider";
import * as Colors from "material-ui/styles/colors";

import { Card, CardActions, CardHeader, CardMedia, CardTitle, CardText } from 'material-ui/Card';
import FlatButton from 'material-ui/FlatButton';
import Divider from 'material-ui/Divider';
import TextField from 'material-ui/TextField';
import Subheader from 'material-ui/Subheader';

import Flexbox from 'flexbox-react';
import { IComponentProps } from "../utils/IComponentProps";

export class ForgotAccount extends React.Component<IComponentProps, any> {
    onBack() {
        this.props.history.replace("/");
    }

    render() {
        return (
            <MuiThemeProvider >
                <Flexbox flexDirection="column" height="100vh"
                    style={{ overflow: "hidden", backgroundColor: Colors.blueGrey50 }}>
                    <SimpleToolbar title={"ChitChat team communication."} onBackPressed={this.onBack.bind(this)} />

                    <Flexbox flexGrow={1} />
                    <Flexbox justifyContent="center" alignItems="center">
                        <Card style={{ width: 400 }}>
                            <Subheader style={{ color: Colors.black, fontSize: 16 }}>Find Your Account</Subheader>
                            <Divider inset={false} />
                            <CardText>
                                Please enter your email address to search for your account.
                                </CardText>
                            <TextField hintText="Email address" style={{ paddingLeft: 15 }} value={""} onChange={() => { }} onKeyDown={() => { }} />
                            <CardActions>
                                <FlatButton label="Search" primary={true} />
                                <FlatButton label="Cancel" onClick={this.onBack.bind(this)} />
                            </CardActions>
                        </Card>
                    </Flexbox>
                    <Flexbox flexGrow={1} />

                    <Flexbox element="footer" justifyContent="center">
                        <span>Powered by Stalk realtime communication API.</span>
                    </Flexbox>
                </Flexbox>
            </MuiThemeProvider >
        );
    }
}