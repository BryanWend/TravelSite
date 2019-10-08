var markers = [];
var map;
var service;
var logOnSuccess;


function initMap() {

    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 39.0902, lng: 0.7159 },
        zoom: 3
    });

    map.addListener('click', function (e) {
        placeMarker(e.latLng, map);
    });


}

function placeMarker(position, map) {
    //Remove previous selection
    clearMarkers();
    console.log(position);
    console.log(position.lat);
    console.log(position.lat + 10);
    //Place marker
    let marker = new google.maps.Marker({
        position: position,
        map: map
    });

    //Get marker position for APIs
    let lat = marker.getPosition().lat();
    let lng = marker.getPosition().lng();

    let latlng = new google.maps.LatLng(lat, lng - 2);


    if (markers.length > 0)
        deleteCards();

    showHeaders();

    getEvents(lat, lng);
    //Store for historicals
    markers.push(marker);

    animateDiv();

    //Center on marker
    map.panTo(latlng);
    map.setZoom(7);
}

function clearMarkers() {
    setMapOnAll(null);
}

// Can set or remove historical markers depending on parameter passed
function setMapOnAll(map) {
    for (let i = 0; i < markers.length; i++) {
        markers[i].setMap(map);
    }
}

//Animate the small info summaries to scroll up from bottom on click of map
function animateDiv() {
    if ($('.mini').hasClass('slide-again')) {
        $('.mini').css({ top: '750px' });
        $('.mini').animate({ top: '0' }, 1000);
    } else {
        $('.mini').addClass('slide-again');
        $('.mini').animate({ top: '0' }, 1000);
    }
}

function getEvents(lat, lng) {

    var eventbriteToken = '';
    var flickrAPIKey = '';

    // console.log(lat);
    // console.log(lng);

    $.get('https://www.eventbriteapi.com/v3/events/search/?token=' + eventbriteToken
        + '&location.longitude=' + lng
        + '&location.latitude=' + lat
        + '&location.within=35mi&expand=venue', function (res) {

            // console.log(res.events.length);

            if (res.events.length) {
                for (var i = 0; i < 5; i++) {
                    var event = res.events[i];

                    if (i < 3)
                        addToEventMini(event);

                    makeEventCard(event);
                    // console.dir(event);
                }
            }
        });

    var placeRequest = {
        location: new google.maps.LatLng(lat, lng),
        radius: '35000',
        type: ['lodging']
    };

    service = new google.maps.places.PlacesService(map);
    service.nearbySearch(placeRequest, function (res, status) {

        if (status == google.maps.places.PlacesServiceStatus.OK) {

            console.log(res);

            for (let i = 0; i < 5; i++) {

                if (i < 4)
                    addToHotelMini(res[i]);

                // console.log(res[i]);
                makeHotelCard(res[i]);
            }
        }
    });


    $.get('https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=' + flickrAPIKey
        + '&lat=' + lat
        + '&lon=' + lng
        + '&radius=32&text=nature&format=json&nojsoncallback=1', function (res) {

            //https://farm{farm-id}.staticflickr.com/{server-id}/{id}_{secret}.jpg
            for (let i = 0; i < 60; i++) {
                if (i % 3 == 0) {
                    let flickrImageURL = ('https://farm' + res.photos.photo[i].farm + '.staticflickr.com/' + res.photos.photo[i].server + '/' + res.photos.photo[i].id + '_' + res.photos.photo[i].secret + '.jpg');

                    console.log(flickrImageURL);
                    addImage(flickrImageURL);
                }
            }
            console.log(res);
        });

}

function makeHotelCard(place) {

    let hotelImageURL;

    let photos;

    if (photos)
        photos = place.photos;
    else
        photos = '#';

    // Prewritten Card with jquery, can modify for Flight/Hotel/Etc
    $('#hotelContainer').append('<div class="row rmvCard colorBG"><div class="mb-2 col-md-12"><div class="card border-0 colorBG"><div class="card-body"><div class="row">' +
        '<div class="col-md-2"><img alt="No image :(" src="' + place.photos[0].getUrl() + '"></div>' +
        '<div class="col-md-10"><div class="row"><h5>' + place.name + '</h5></div><div class="row"><div class="col-md-12 p-0"><p>Address: '
        + place.vicinity + '</p></div></div><div class="row"><p>Hotel Rating: ' + place.rating.toFixed(1) + '</p></div></div></div></div></div>');
}

function addToHotelMini(place) {
    $('#hotelMini').append('<div class="miniText"><p><strong>' + place.name + '</strong><br>Rating: ' + place.rating.toFixed(1) + '</p></div>')
}

function addImage(imageURL) {

    $('#flickrImages').append('<div class="col-md-6 p-0 imgContainer"><img class="img-responsive flickrImg" src=' + imageURL + '></div>');
}


//Currently designed for Events but can be modified to work for all 3 categories to avoid rewriting
function makeEventCard(event) {

    let eventImageURL;

    //Ensure event still loads even without a Logo Image
    if (event.logo != null && event.logo != undefined)
        eventImageURL = event.logo.url;
    else
        eventImageURL = "#";

    //Prewritten Card with jquery, can modify for Flight/Hotel/Etc
    $('#eventContainer').append('<a class="cardLink rmvCard" target="_blank" href=' + event.url + '><div class="row colorBG"><div class="mb-2 col-md-12">' +
        '<div class="card border-0 colorBG"><div class="card-body"><div class="row">' +
        '<div class="col-md-2"><img alt="No image :(" src="' + eventImageURL + '"></div>' + //HERE
        '<div class="col-md-10"><div class="row"><h5>' + event.name.text + '</h5></div><div class="row"><div class="col-md-6 p-0"><p>Address: '
        + event.venue.address.city +
        '</p></div><div class="col-md-6 p-0"><p>Start Time: ' + convertDate(event.start.local) + '</p></div></div>' +
        '<div class="row"><p>' + event.description.text.substring(0, 350) + '...  <span>Read More</span></p></div>' +
        '</div></div></div></div></div></div></a>');
}

//Add content to small section tied to map
function addToEventMini(event) {
    $('#eventMini').append('<div class="miniText"><p><strong>' + event.name.text.substring(0, 20) + '...</strong><br>' + event.description.text.substring(0, 70) + '...</p></div>')
}

//Clear all content for new selection
function deleteCards() {
    $('.rmvCard').remove();
    $('.miniText').remove();
    $('.imgContainer').remove();
}

function showHeaders() {
    $('#hotelHeader').removeClass('d-none');
    $('#eventHeader').removeClass('d-none');
    $('#cardWrapper').addClass('cardBGColor');
    $('#imageGrid').addClass('gridColor');
}

function convertDate(date) {
    return new Date(date).toLocaleString();
}

function LogOn(name, password) {
    var webMethod = "ProjectServices.asmx/LogOn";
    var parameters = "{\"uid\":\"" + encodeURI(name) + "\",\"pass\":\"" + encodeURI(password) + "\"}";

    //jQuery ajax method
    $.ajax({
        type: "POST",
        url: webMethod,
        data: parameters,
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (msg) {

            if (msg.d) {
                console.log(msg.d);
                window.location.replace("./index.html");
                logOnSuccess = true;
                //$('#navbarDropdownMenuLink').removeClass('d-none');
                //$('#loginNav').addClass('d-none');
                //$('#signupNav').addClass('d-none');
            }
            else {

                alert("logon failed");
            }
        },
        error: function (e) {
            alert("no...");
        }
    });
}

$(document).ready(function () {
    //if (logOnSuccess) {
        $('#navbarDropdownMenuLink').removeClass('d-none');
        $('#loginNav').addClass('d-none');
        $('#signupNav').addClass('d-none');
    //}

})