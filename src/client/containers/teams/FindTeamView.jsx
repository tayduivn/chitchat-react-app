import * as React from "react";
import Flexbox from "flexbox-react";
import { RaisedButton, TextField } from 'material-ui';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
const styles = {
    span: {
        padding: 8
    },
    button: {
        width: '100%'
    },
    box: {
        bottom: 0,
        position: 'absolute'
    }
};
const FindButton = (props) => (<RaisedButton primary={true} label="Find Now" onClick={props.onSubmit}>
    </RaisedButton>);
const CreateNewButton = (props) => (<RaisedButton primary={true} label="Create New" onClick={props.onCreateNewPress}>
    </RaisedButton>);
export const FindTeamView = (props) => {
    return (<MuiThemeProvider>
            <Flexbox flexDirection="column" alignItems='center' justifyContent='center'>
                <h3>Find your team</h3>
                <TextField hintText="Enter your team name" value={props.team_name} onChange={props.onNameChange} onKeyDown={(e) => {
        if (e.key === 'Enter')
            props.onSubmit();
    }}/>
                <span style={styles.span}/>
                <FindButton {...props}/>
                <span style={styles.span}/>

                <Flexbox flexDirection="row" alignItems='center' justifyContent='center'>
                    <p>Create new team?</p>
                    <span style={styles.span}/>
                    <CreateNewButton {...props}/>
                </Flexbox>
            </Flexbox>
        </MuiThemeProvider>);
};