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