import React, { useState, useCallback } from "react";
import {
  Map,
  GoogleApiWrapper,
  InfoWindow,
  Marker,
  Circle,
} from "google-maps-react";
import cities from "../csvjson.json";
import Swal from "sweetalert2";
import greenDot from "../greenDot.png";
import Control from "./Control";

const mapStyles = {
  width: "100%",
  height: "100%",
};

const getRandomLocation = () => {
  return cities[Math.floor(Math.random() * cities.length)];
};

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  var R = 6371; // Radius of the earth in km
  var dLat = deg2rad(lat2 - lat1); // deg2rad below
  var dLon = deg2rad(lon2 - lon1);
  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c; // Distance in km
  return d;
}

export function MapContainer(props) {
  const [showingInfoWindow, setShowingInfoWindow] = useState(true); // Hides or shows the InfoWindow
  const [activeMarker, setActiveMarker] = useState({}); // Shows the active marker upon click
  const [selectedPlace, setSelectedPlace] = useState({}); // Shows the InfoWindow to the selected place upon a marker
  const [randomLocation, setRandomLocation] = useState({});
  const [markerLocation, setMarkerLocation] = useState({});
  const [visible, setVisible] = useState(false);
  const [score, setScore] = useState(0);
  const [turnCounter, setTurnCounter] = useState(1);
  const [hint, setHint] = useState(false);
  const [highScore, setHighScore] = useState(localStorage.getItem("highScore"));
  const [hintAmount, setHintAmount] = useState(1);

  const mapStyle = [
    {
      featureType: "all",
      elementType: "labels",
      stylers: [{ visibility: "off" }],
    },
  ];

  const startRound = useCallback(() => {
    let checkerForLocation = "";
    let location = getRandomLocation();
    while (checkerForLocation.length === 0) {
      location = getRandomLocation();
      checkerForLocation = location.MGLSDE_LOC;
    }

    setRandomLocation({
      lat: location.Y,
      lng: location.X,
      name: location.MGLSDE_LOC,
    });
  }, []);

  const nextTurn = useCallback(() => {
    if (visible) {
      setHint(false);
      setVisible(false);
      setMarkerLocation({});
      if (turnCounter !== 5) {
        setTurnCounter((prev) => prev + 1);
        startRound();
      } else {
        setHintAmount(1);
        if (!highScore || score < parseInt(highScore)) {
          localStorage.setItem("highScore", score);
          setHighScore(score);
          Swal.fire({
            title: "!וואו שיא חדש",
            text: `סיימת את המשחק עם מרחק של ${score} קילומטרים`,
            icon: "success",
            confirmButtonText: "התחל משחק חדש",
          }).then(() => {
            setScore(0);
            setTurnCounter(1);
            startRound();
          });
        } else {
          Swal.fire({
            title: "!כל הכבוד",
            text: `סיימת את המשחק עם מרחק של ${score} קילומטרים`,
            icon: "success",
            confirmButtonText: "התחל משחק חדש",
          }).then(() => {
            setScore(0);
            setTurnCounter(1);
            startRound();
          });
        }
      }
    } else {
      Swal.fire("!חכה", "!סיים את התור קודם", "error");
    }
  }, [visible, score, turnCounter, highScore, startRound]);

  const _mapLoaded = (mapProps, map) => {
    map.setOptions({
      styles: mapStyle,
    });
  };

  const onMarkerClick = (props, marker, e) => {
    setShowingInfoWindow(true);
    setActiveMarker(marker);
    setSelectedPlace(props);
  };

  const onClose = (props) => {
    if (showingInfoWindow) {
      setShowingInfoWindow(false);
      setActiveMarker(null);
    }
  };
  return (
    <>
      <Control
        visible={visible}
        hint={hint}
        setHintAmount={setHintAmount}
        hintAmount={hintAmount}
        highScore={highScore}
        setHint={setHint}
        location={randomLocation.name}
        nextTurn={nextTurn}
        score={score}
        turn={turnCounter}
      />
      <Map
        onClick={(e, b, c) => {
          setMarkerLocation({
            lat: c.latLng.lat(),
            lng: c.latLng.lng(),
          });
          const distance = Math.round(
            getDistanceFromLatLonInKm(
              c.latLng.lat(),
              c.latLng.lng(),
              randomLocation.lat,
              randomLocation.lng
            )
          );
          if (!visible) {
            setScore((prev) => prev + distance);
            if (distance <= 20) {
              Swal.fire(
                "!כל הכבוד",
                "המרחק שלך בקילומטרים היה: " + distance,
                "success"
              );
              setHintAmount(hintAmount + 1);
            } else {
              Swal.fire(
                "!טעות",
                "המרחק שלך בקילומטרים היה: " + String(distance),
                "error"
              );
            }
          } else {
            Swal.fire("!כבר שיחקת", "עליך להמשיך לתור הבא", "error");
          }
          setVisible(true);
        }}
        google={props.google}
        zoom={7.8}
        style={mapStyles}
        initialCenter={{
          lat: 31.46667,
          lng: 34.783333,
        }}
        onReady={(mapProps, map) => {
          _mapLoaded(mapProps, map);
          setTimeout(() => {
            startRound();
          }, 1000);
        }}
      >
        <Marker position={markerLocation} />
        {visible && (
          <Marker
            position={randomLocation}
            onClick={onMarkerClick}
            name={randomLocation.name}
            options={{ icon: greenDot }}
          />
        )}
        {hint && (
          <Circle
            radius={100000}
            center={{
              lat: randomLocation.lat + Math.random() / 1.6,
              lng: randomLocation.lng + Math.random() / 1.6,
            }}
            strokeColor="transparent"
            strokeOpacity={0}
            strokeWeight={5}
            fillColor="#FF0000"
            fillOpacity={0.2}
            clickable={false}
          />
        )}
        <InfoWindow
          marker={activeMarker}
          visible={showingInfoWindow}
          onClose={onClose}
        >
          <div>
            <h4>{selectedPlace.name}</h4>
          </div>
        </InfoWindow>
      </Map>
    </>
  );
}

export default GoogleApiWrapper({
  apiKey: "AIzaSyA1jO5KCUbo5ifKHb4LK5ilBN2Fp0NZb5Y",
})(MapContainer);
