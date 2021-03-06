﻿import * as React from "react";
import Subheader from "material-ui/Subheader";
import RaisedButton from "material-ui/RaisedButton";

const style = {
    margin: 6,
};

import { TeamListView } from "./TeamListView";
import { ITeam } from "../../chitchat/chats/models/ITeam";

abstract class IComponentNameProps {
    teams: Array<any>;
    onSelectTeam: (team: ITeam) => void;
}

export const TeamListBox = (props: IComponentNameProps) => (
    <div>
        <Subheader>You're already to join this team:</Subheader>
        <TeamListView
            items={props.teams}
            onSelectItem={props.onSelectTeam}
            actionChild={<RaisedButton label="Enter" primary={true} style={style} />} />
    </div>
);
