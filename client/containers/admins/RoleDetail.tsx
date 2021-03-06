import * as React from "react";
import { gql, graphql } from 'react-apollo';
import { compose, pure } from "recompose";
import Flexbox from "flexbox-react";

import { Paper, Card, CardTitle } from "material-ui";
import { grey400, darkBlack, darkWhite, lightBlack } from "material-ui/styles/colors";

import { LinearProgressSimple } from "../../components/LinearProgressSimple";
import { MemberList } from "../../components/MemberList";

const RoleDetail = ({ data: { teamProfiles, loading, error } }) => {
    if (!error && !loading) {
        let users = [];
        if (Array.isArray(teamProfiles)) {
            teamProfiles.map(v => (!!v.user) ? users.push(v.user) : null);
        }

        return <MemberList items={users} />
    }
    else {
        return <LinearProgressSimple />
    }
};

// We use the gql tag to parse our query string into a query document
const getTeamProfile = gql`
  query getTeamProfile($team_id : String!, $role_name: String!) {
    teamProfiles(team_id: $team_id, role_name: $role_name) {
        team_role
        user {
            username
            firstname
            lastname
            tel
            email
            avatar
            status
        } 
    }
}
`;
const withData = graphql(getTeamProfile, {
    options: ({ team_id, role_name }) => ({
        variables: { team_id, role_name }, fetchPolicy: 'cache-and-network'
    })
});
const RoleDetailWithData = compose(
    withData, pure
)(RoleDetail) as React.ComponentClass<{ team_id, role_name }>;

export const RoleDetailEnhanced = ({ team_id, role_name }) => (
    <Flexbox flexDirection="column" minWidth="400px" style={{ backgroundColor: darkWhite }}>
        <Card>
            <CardTitle title={role_name} />
        </Card>
        <div style={{ overflowY: "auto" }}>
            <RoleDetailWithData team_id={team_id} role_name={role_name} />
        </div>
    </Flexbox>
);