let markers = [];
var map;

function initMap() {
	
	map = new google.maps.Map(document.getElementById('map'), {
	  center: {lat: 39.0902, lng: 0.7159},
	  zoom: 3
	});

	map.addListener('click', function(e) {
  	placeMarker(e.latLng, map);
	});
}

function placeMarker(position, map) {
  //Remove previous selection
  clearMarkers();

  //Place marker
  let marker = new google.maps.Marker({
    position: position,
    map: map
  });

  let lat = marker.getPosition().lat();
  let lng = marker.getPosition().lng();

  console.log("Lat: " + lat + ", Lng: " + lng);

  if(markers.length > 0)
    deleteCards();
  
  getEvents(lat, lng);
  //Store for historicals
  markers.push(marker);

  animateDiv();
  //Center on marker
  map.panTo(position);
}

function clearMarkers(){
	setMapOnAll(null);
}

// Can set or remove historical markers depending on parameter passed
function setMapOnAll(map) {
  for (let i = 0; i < markers.length; i++) {
    markers[i].setMap(map);
  }
}

//Animate the small info summaries to scroll up from bottom on click of map
function animateDiv(){
  if($('.mini').hasClass('slide-again')) {
    $('.mini').css({ top: '750px' });
  	$('.mini').animate({ top: '0' }, 1000);
  } else {
    $('.mini').addClass('slide-again');
  	$('.mini').animate({ top: '0' }, 1000);
  }
}


function getEvents(lat, lng){

  var eventbriteToken = '';
  // var $events = $("#events");

  $.get('https://www.eventbriteapi.com/v3/events/search/?token=' + eventbriteToken 
    + '&location.longitude=' + lng 
    + '&location.latitude=' + lat 
    + '&location.within=35mi&expand=venue', function(res) {

    console.log(res.events.length);

    if(res.events.length) {
      // var s = "<ul class='eventList'>";
      for(var i = 0; i < 4; i++) {
        var event = res.events[i];

        makeCard(event);

        console.dir(event);


      }
    }
  });
}

function makeCard(event){

  let eventImageURL;

  if (event.logo != null && event.logo != undefined)
    eventImageURL = event.logo.url;
  else
    eventImageURL = "#";

  $('#eventContainer').append('<a class="cardLink center-block img-responsive" target="_blank" href=' + event.url + '<div class="row"><div class="mb-2 col-md-12">'+
    '<div class="card border-0"><div class="card-body"><div class="row">' +
    '<div class="col-md-2"><img alt="No image :(" src="' + eventImageURL + '"></div>' + //HERE
    '<div class="col-md-5"><p>' + event.name.text.substring(0, 25) + '...</p><p>Area: ' + event.venue.address.city + 
    '</p><p>Start Time: ' + event.start.local + '</p></div>' +
    '<div class="col-md-5"><p>&nbsp</p><p>To: </p><p>End time: ' + event.end.local + '</p></div>' +
    '</div></div></div></div></div></a>');

}

function deleteCards(){
  $('.cardLink').remove();

}

