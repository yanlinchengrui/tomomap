import React, { Component } from 'react';
import { Card, Button, CardTitle, Form, FormGroup, Input, Label } from 'reactstrap';
import { Map, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet';
import Axios from 'axios';
import './App.css';
import { popupContent, popupHead, popupText, popupImage } from './styles/popUpStyle';

const myIcon = L.icon({
  iconUrl: 'https://img.icons8.com/ios-filled/100/000000/blueteam.png',
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -28],
});

const api_msg = 'Your backend API here...';
const api_img = 'Your backend API here...';

class App extends Component {

  state = {
    latlon: {
      lat: 51.505,
      lon: -0.09
    },
    showForm: false,
    haveLocation: false,
    sendingMsg: false,
    sentMsg: false,
    zoom: 3,
    user: {
      name: '',
      message: '',
      image: '',
    },
    msgs: []
  }

  componentDidMount() {

    Axios.get(api_msg)
      .then(messages => {
        this.setState({
          msgs: messages.data
        });
      });

    navigator.geolocation.getCurrentPosition((position) => {
      console.log(position);
      this.setState({
        latlon: {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        },
        zoom: 12,
        haveLocation: true,
      });
    },
      () => {
        console.log('Cannot get geolocation from current browser');
        Axios.get('https://ipapi.co/json')
          .then(position => {
            this.setState({
              latlon: {
                lat: position.data.latitude,
                lon: position.data.longitude,
              },
              zoom: 12,
              haveLocation: true,
            })
          })
      }, { maximumAge: 60000, timeout: 5000 });
  }

  showOrHideForm = () => {
    this.setState({
      showForm: !this.state.showForm
    });
  }

  submitMessage = (e) => {
    e.preventDefault();
    const userMsg = {
      name: this.state.user.name,
      message: this.state.user.message,
    };
    this.setState({
      sendingMsg: true,
    });

    if (this.state.user.image) {
      const formData = new FormData();
      formData.append('image', this.state.user.image);
      const config = {
        headers: {
          'content-type': 'multipart/form-data'
        }
      };
      Axios.post(api_img, formData, config)
        .then((rez) => {
          Axios.post(api_msg, {
            ...userMsg,
            image: rez.data.imageUrl,
            lat: this.state.latlon.lat,
            lon: this.state.latlon.lon
          }).then((msg) => {
            console.log(msg);
          });
        });
    } else {
      Axios.post(api_msg, {
        ...userMsg,
        lat: this.state.latlon.lat,
        lon: this.state.latlon.lon
      }).then((msg) => {
        console.log(msg);
      });
    }

    setTimeout(() => {
      this.setState({
        sentMsg: true,
        sendingMsg: false
      });
    }, 3000);
  }

  changed = (e) => {
    const nameField = e.target.name;
    let valField = e.target.value;
    // console.log(nameField, valField);
    if (nameField === 'image') {
      valField = e.target.files[0];
    }
    this.setState((prevState) => ({
      user: {
        ...prevState.user,
        [nameField]: valField
      }
    }))
  }

  imageOnChange = (e) => {
    e.preventDefault();
    this.setState((prevState) => ({
      user: {
        ...prevState.user,
        'image': e.target.files[0]
      }
    }));
    console.log(e.target.files[0]);
  }

  render() {
    const position = [this.state.latlon.lat, this.state.latlon.lon];
    const southWest = L.latLng(-89.98155760646617, -180),
      northEast = L.latLng(89.99346179538875, 180);
    const bounds = L.latLngBounds(southWest, northEast);

    return (
      <div className="map">
        <Map className="map" center={position}
          zoom={this.state.zoom} maxBoundsViscosity={1.0}
          maxBounds={bounds} panInsideBounds={(bounds)}
          minZoom={2.5} maxZoom={18}>
          <TileLayer
            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            noWrap='true'
          />
          {this.state.haveLocation ?
            <Marker position={position} icon={myIcon}>
              <Popup>
                <div style={popupContent}>
                  <div style={popupText}> Here is where you are :) </div>
                </div>
              </Popup>
            </Marker> : ''
          }
          {this.state.msgs.map(message => (
            <Marker
              key={message._id}
              position={[message.lat, message.lon]}
              icon={myIcon}>

              <Popup>
                <div style={popupContent}>
                  <div style={popupHead}><em> {message.name} </em></div>
                  <div style={popupText}> {message.message} </div>
                  {message.image && <img style={popupImage} src={message.image} alt="messageImg" />}
                </div>
              </Popup>
            </Marker>
          ))}
        </Map>
        {
          !this.state.showForm ?
            <Button className="message" onClick={this.showOrHideForm} color="info">Leave a Message</Button>
            :
            <Card body className="message">
              <CardTitle><strong> Leave a message here! </strong></CardTitle>
              {!this.state.sendingMsg && !this.state.sentMsg && this.state.haveLocation ?
                <Form onSubmit={this.submitMessage}>
                  <FormGroup>
                    <Label for="name"> <strong> Your name: </strong></Label>
                    <Input
                      onChange={this.changed}
                      type="text"
                      name="name"
                      id="name"
                      placeholder="name..."
                      required
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label for="message"><strong> Your message: </strong></Label>
                    <Input
                      onChange={this.changed}
                      type="textarea"
                      name="message"
                      id="message"
                      placeholder="message..."
                      required
                    />
                  </FormGroup>
                  <FormGroup>
                    <Label for="image"><strong> Your image: </strong></Label>
                    <Input type="file" name="image" id="image" accept="image/*" onChange={this.changed} />
                  </FormGroup>
                  <Button type="submit" color="success" disabled={!this.state.haveLocation}>Send!</Button>
                  <Button className="message-hide" onClick={this.showOrHideForm} color="danger"> X </Button>
                </Form> :
                this.state.sendingMsg || !this.state.haveLocation ?
                  <video autoPlay loop src="https://media.giphy.com/media/xT9DPldJHzZKtOnEn6/giphy.mp4"></video> :
                  <CardTitle>Thanks for submitting!</CardTitle>
              }
            </Card>
        }
      </div>
    );
  }
}

export default App;
