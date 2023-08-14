import React, { Component } from "react";


import { Map, InfoWindow, Marker, GoogleApiWrapper } from 'google-maps-react';

const mapStyles = {
    width: '90%',
    height: '45%'
};

export class MapContainer extends Component {
    constructor(props) {
        super(props)

        this.state = {
            selectedPlace: props,
            activeMarker: null,
            showingInfoWindow: false
        }
    }


    onMarkerClick = (props, marker, e) =>
        this.setState({
            selectedPlace: props,
            activeMarker: marker,
            showingInfoWindow: true
        });

    onClose = props => {
        if (this.state.showingInfoWindow) {
            this.setState({
                showingInfoWindow: false,
                activeMarker: null
            });
        }
    };

    render() {
        return (
            <Map style={mapStyles} google={this.props.google} zoom={14} initialCenter={{ lat: this.props.providerDetails.lat, lng: this.props.providerDetails.lng }}>

                <Marker
                    onClick={this.onMarkerClick}
                    name={'Kenyatta International Convention Centre'}
                />

                <InfoWindow
                    marker={this.state.activeMarker}
                    visible={this.state.showingInfoWindow}
                    onClose={this.onClose}
                >
                    <div className="google-map">
                        <h4>{this.props.providerAddress}</h4>
                    </div>
                </InfoWindow>
            </Map>

        );
    }
}

export default GoogleApiWrapper({
    apiKey: ('AIzaSyDOUpdwyZ0MleJZpYjBFZsMvbRNSU8q_YA')
})(MapContainer)