/**
 * Created by James on 11/9/13.
 */
var watchID = null;
// Save the positions' history
var path = [];

var velocity = [0];
var times = [];
var distances = [];

//Klaus for check mark
var Klaus = new google.maps.LatLng(33.777211996, -84.396532868);
var VanLeer = new google.maps.LatLng(33.777586, -84.39716);
var isDestination = false;
var map;
var origin;
var destination;
var lastInfoWindow;

$(document).ready(function(){

    //geocoder = new google.maps.Geocoder();
    //checkpoint(Klaus);

    var mapOptn = {
        zoom        : 18,
        //center      : googleLatLng,
        mapTypeID   : google.maps.MapTypeId.ROAD
    }

    //draw the map one time and the adjust the center
    //problem: when cannot get the coordinate, it stucks at the error screen
    map = new google.maps.Map(document.getElementById("map"), mapOptn);

    if( navigator.geolocation ){
        var optn = {
          enableHighAccuracy: true,
          timeout           : Infinity, //timeout in a minute
          maximumAge        : 1000
        };
        watchID = navigator.geolocation.watchPosition(success, fail, optn);
    }
    else
        $("p").html("HTML5 Not Supported");

    //stop watching
    $("button").click(function(){
        if (watchID)
            navigator.geolocation.clearWatch(watchID);
        watchID = null;

        return false;
    });

});

function fail (error){

    var errorType ={
        0: "Unknown Errors",
        1: "Permission denied by user",
        2: "Position user is not available",
        3: "Request timeout"
    };

    var errMsg = errorType[error.type];

    if(error.code == 0 || error.code == 2){
        errMsg = errMsg + " - " + error.message;
    }

    $("p").html(errMsg);
}

function success(position)
{
    var googleLatLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude );

    //destination is the lastest location pushed in path
    destination = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);


    // Save the current position
    path.push(destination);
    times.push(new Date().getTime());
    if (path.length > 2){
        distance = google.maps.geometry.spherical.computeDistanceBetween (path[path.length - 1], path[path.length - 2]);
        distances.push(distance);
        velocity.push(distance / (times[times.length - 1] - times[times.length - 2])*1000);
    }


    map.setCenter(destination);
    //set the original location
    origin = path[0];

    addMarker(map, googleLatLng, position, "You are here!", isDestination);
    checkpoint(map, Klaus);
    checkpoint(map, VanLeer);

    // Create the array that will be used to fit the view to the points range and
    // place the markers to the polyline's points
    var latLngBounds = new google.maps.LatLngBounds();
    for(var i = 0; i < path.length; i++) {
        latLngBounds.extend(path[i]);
    }

    //var colorVelocity = 0xFF;
    // Creates the polyline object
    if (velocity[velocity.length - 1] >= 10)
        colorVelocity = 10;
    else
        colorVelocity = velocity[velocity.length - 1];

    var color = Math.round(0xFF << (colorVelocity * 8.0 / 5)).toString(16);

    while (color.length < 6) {
        color = "0" + color;
    }
    //markersArray.push(path);
    color = "#" + color;
    var polyline = new google.maps.Polyline({
        map: map,
        path: path,
        strokeColor: color,
        strokeOpacity: 1.0,
        strokeWeight: 3
    });

    // Fit the bounds of the generated points
    mapObject.fitBounds(latLngBounds);

}

function addMarker (map, googleLatLng, position, title, isDestination){

    //cool animation
    //var marker= new google.maps.Marker(markerOptn);
    //marker.setAnimation(google.maps.Animation.DROP); //BOUNCE, DROP

    //set up info window upon clicking marker or not event need to click
    var infoLoc = position.coords.latitude + "<br>" + position.coords.longitude;
    var infoWindow=new google.maps.InfoWindow({ content: "Speed: " + velocity[velocity.length -1].toString(),
                                                        position: googleLatLng});

    //google.maps.event.addListener(marker, "click", function(){
        if(lastInfoWindow)
            lastInfoWindow.close();
        infoWindow.open(map);
        lastInfoWindow = infoWindow;
    //});
}

function checkpoint(map, position){

    var image = 'checkPoint1.png';

    var marker = new google.maps.Marker({
        position: position,
        map: map,
        icon: image
    });
}

