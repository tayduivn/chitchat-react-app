import * as React from 'react';
import { withGoogleMap, GoogleMap, Marker } from "react-google-maps";
import withScriptjs from "react-google-maps/lib/async/withScriptjs";
// Wrap all `react-google-maps` components with `withGoogleMap` HOC
// and name it GettingStartedGoogleMap
export const SimpleGoogleMap = withScriptjs(withGoogleMap((props) => {
    console.log("GoogleMap", props.marker);
    return (React.createElement(GoogleMap, { ref: props.onMapLoad, defaultZoom: 15, defaultCenter: props.marker.position, onClick: props.onMapClick }, (props.marker) ? React.createElement(Marker, Object.assign({}, props.marker)) : null));
}));
