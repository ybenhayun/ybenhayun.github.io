// approximate boston lat lng
var globalLat = 42.1;
var globalLng= -71.11;

var map;
var userMarker;

// example format: charArr = [{name: "nr", distance: 20}, {name: "carmen", distance: 2001}]
var charArr = [];

// example format: distanceArr = [20, 2001]
var distanceArr = [];


function init()
{
        var initCenter = new google.maps.LatLng(42.3599611, -71.0567528);

        // Set up map
        var myOptions = {
                zoom: 13, // The larger the zoom number, the bigger the zoom
                center: initCenter,
                mapTypeId: google.maps.MapTypeId.ROADMAP
        };
                                
        // Create the map in the "map_canvas" <div>
        map = new google.maps.Map(document.getElementById("map_canvas"), myOptions);
}

if (navigator.geolocation) {

        navigator.geolocation.getCurrentPosition(function(position) {
                globalLat = position.coords.latitude;
                globalLng= position.coords.longitude;
                addUserMarker();
                loc = new google.maps.LatLng(globalLat, globalLng);
                map.panTo(loc);
                xhr(); // xmlHTTPrequest to get student and character data
        });

} else {
        alert("Geolocation is not supported by your web browser.  What a shame!");
}

// add marker using the users location
function addUserMarker() {

        loc = new google.maps.LatLng(globalLat, globalLng);
        // Create a marker                              
        userMarker = new google.maps.Marker({
                position: loc,
                title: "Mulan",
                icon: 'mulan.png'
        });

        addInfoToUser(userMarker);

        // add marker to map
        userMarker.setMap(map);
}

// create a marker with an icon and add it to the map
// call where icon is "" to have default icon
function addMarker(latitude, longitude, title, icon, time) {

        loc = new google.maps.LatLng(latitude, longitude);

        // Create a marker                              
        marker = new google.maps.Marker({
                position: loc,
                title: title,
                icon: icon,
                time: time,
                lat: latitude,
                lng: longitude
        });


        addInfoToStudent(marker);

        // add marker to map
        marker.setMap(map);
}

// adds a character marker to the map
function addCharMarker(mapchar) {

        loc = new google.maps.LatLng(mapchar.loc.latitude, mapchar.loc.longitude);

        // Create a marker                              
        marker = new google.maps.Marker({
                position: loc,
                title: mapchar.name,
                icon: mapchar.name + ".png",
                lat: mapchar.loc.latitude,
                lng: mapchar.loc.longitude
        });

        addInfoToChar(marker, mapchar.loc.note);
        addPolyline(marker);

        // add character to charArr array
        var distance = haversine(marker.lat, marker.lng, globalLat, globalLng);
        var elem = {name: marker.title, distance: distance};
        charArr.push(elem);


        // add marker to map
        marker.setMap(map);
}

function addInfoToUser(marker) {

        var infowindow = new google.maps.InfoWindow();

        // Open info window on click of userMarker
        google.maps.event.addListener(marker, 'click', function() {
                infowindow.close();
                infowindow.setContent(marker.title);
                infowindow.open(map, marker);
        });
}

// adds a character info window to the marker with the corresponding note
function addInfoToChar(marker, note) {

        var infowindow = new google.maps.InfoWindow();

        var content = '<p>Name: ' + marker.title + '</p><p>Latitude: ' +
        marker.lat + ' Longitude: ' + marker.lng + 
        '</p><p>Note: ' + note;

        // Open info window on click of userMarker
        google.maps.event.addListener(marker, 'click', function() {
                infowindow.close();
                infowindow.setContent(content);
                infowindow.open(map, marker);
        });
}

// add info window to marker specified in parameter
function addInfoToStudent(marker) {
        // This is a global info window...
        var infowindow = new google.maps.InfoWindow();    

        var content = '<p>Login: ' + marker.title + '</p><p>Latitude: ' +
        marker.lat + ' Longitude: ' + marker.lng + 
        '</p><p>Timestamp: ' + marker.time;

        // Open info window on click of userMarker
        google.maps.event.addListener(marker, 'click', function() {
                infowindow.close();
                infowindow.setContent(content);
                infowindow.open(map, marker);
        });
}

function addPolyline(marker) {

        var lineCoordinates = [
                new google.maps.LatLng(marker.lat, marker.lng),
                new google.maps.LatLng(globalLat, globalLng)
        ];
        var charPath = new google.maps.Polyline({
                path: lineCoordinates,
                geodesic: true,
                strokeColor: '#FF0000',
                strokeOpacity: 1.0,
                strokeWeight: 2
        });

        charPath.setMap(map);
}

function toRad(x) {
   return x * Math.PI / 180;
}

//returns distance between 2 latitudes and longitudes in miles
function haversine(lat1, lon1, lat2, lon2) {
        var R = 6371; // km 
        var x1 = lat2-lat1;
        var dLat = toRad(x1);  
        var x2 = lon2-lon1;
        var dLon = toRad(x2);  
        var a = Math.sin(dLat/2) * Math.sin(dLat/2) + 
                        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
                        Math.sin(dLon/2) * Math.sin(dLon/2);  
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 

        return R * c / 1.609;
}

function displayDistanceChart() {
        
        charArr.sort(sortCharactersArr);

        // display in header div
        var charDistances = '<h1>Marauders Map</h1> <h2>Distance from you: <br></h2>';

        for (i = 0; i < charArr.length; i++) {
                charDistances = charDistances + '<p>' + charArr[i].name +
                ': ' + charArr[i].distance + ' miles</p>';
        }

        document.getElementById("header").innerHTML = charDistances;
}

function sortCharactersArr(a, b) {

        return a.distance - b.distance;
}

var xhr;

function xhr() {

        xhr = new XMLHttpRequest();
        xhr.open("post", "http://chickenofthesea.herokuapp.com/sendLocation", true);
        xhr.onreadystatechange = dataReady;
        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        var params = "login=Mulan&lat=" + globalLat+ "&lng=" + globalLng;
        xhr.send(params); // Go! Execute!
}
        function dataReady() {
        // The readyState numbers:
        // 0 = not initialized
        // 1 = Set up
        // 2 = Sent
        // 3 = In progress
        // 4 = Complete
        if (xhr.readyState == 4 && xhr.status == 200) {
                data = JSON.parse(xhr.responseText); 
                parseData(data);
        }
        else if (xhr.readyState == 4 && xhr.status == 500) {
                alert("XMLHttpRequest failed");
        }
}

// save json data in varables, make markers with data
function parseData(data) {
        var i = 0;
        for (i = 0; i < data.characters.length; i++) {
                // make character markers

                addCharMarker(data.characters[i]);

        }
        var j  = 0;
        for (j = 0; j < data.students.length; j++) {
                //make student markers
                slat = data.students[j].lat;
                slng = data.students[j].lng;
                title = data.students[j].login;
                id = data.students[j]._id;
                time = data.students[j].created_at;
                addMarker(slat, slng, title, "", time);
        }
        displayDistanceChart();
}