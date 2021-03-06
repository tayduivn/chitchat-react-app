import * as React from "react";
import { List, ListItem } from "material-ui/List";
import Divider from "material-ui/Divider";
import { darkBlack } from "material-ui/styles/colors";
const renderList = (props) => (props.items.map((item, i) => (<div key={i}>
            <ListItem leftIcon={null} rightIcon={null} primaryText={item.name} secondaryText={<p style={{ color: darkBlack }}>{item.description}</p>} onClick={(event) => props.onSelected(item)}/>
            <Divider />
        </div>)));
export const GroupListView = (props) => (<div>
        <List>
            {(!!props.items) ? renderList(props) : null}
        </List>
    </div>);
