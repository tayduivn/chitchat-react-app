import * as React from "react";
import { gql, graphql } from 'react-apollo';
import { compose, pure } from "recompose";
import { Card, CardTitle } from "material-ui";

import { GroupListView } from "./GroupListView";
import { Room } from "../../chitchat/chats/models/Room";
import { IOrgChart } from "../../chitchat/chats/models/OrgChart";

interface ICompProps {
    chartItem: IOrgChart;
    groups?: Array<Room>;
    onSelectItem: (item: Room) => void;
}

const GroupsOfChart = ({ data, onSelectItem }) => {
    return (data.loading || data.error)
        ? null
        : <GroupListView items={data.chart.rooms} onSelected={onSelectItem} />;
}


const getChartItemQuery = gql`query getChartItem($id: String!) {
     chart(id: $id) {
        _id
        chart_name
        chart_description
        chart_level
        team_id
        rooms {
            _id
            name
            status
            type
            team_id
            description
            createTime
        }
    }
}`;
const withData = graphql(getChartItemQuery, {
    options: ({ id }) => ({
        variables: { id },
    })
});
// Attach the data HoC to the pure component
const GroupsOfChartEnhanced = compose(
    withData,
    pure,
)(GroupsOfChart) as React.ComponentClass<{ id, onSelectItem }>;

export const GroupsPure = ({ chartItem, onSelectItem }: ICompProps) => (
    <div style={{ width: `100%` }}>
        <Card>
            <CardTitle title={chartItem.chart_name} />
        </Card>
        <GroupsOfChartEnhanced id={chartItem._id} onSelectItem={onSelectItem} />
    </div>
);