import * as React from 'react';
import { withGoogleMap, GoogleMap, Marker } from "react-google-maps";
import withScriptjs from "react-google-maps/lib/async/withScriptjs";
export const SimpleGoogleMap = withScriptjs(withGoogleMap((props) => {
    console.log("GoogleMap", props.marker);
    return (<GoogleMap ref={props.onMapLoad} defaultZoom={15} defaultCenter={props.marker.position} onClick={props.onMapClick}>
            {(props.marker) ? <Marker {...props.marker}/> : null}
        </GoogleMap>);
}));
