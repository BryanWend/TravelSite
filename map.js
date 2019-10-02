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

  let latlng = new google.maps.LatLng(lat, lng - 5);


  if(markers.length > 0)
    deleteCards();
  
  getEvents(lat, lng);
  //Store for historicals
  markers.push(marker);

  animateDiv();

  //Center on marker
  map.panTo(latlng);
  map.setZoom(7);
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
  var flickrAPIKey = '';

  $.get('https://www.eventbriteapi.com/v3/events/search/?token=' + eventbriteToken 
    + '&location.longitude=' + lng 
    + '&location.latitude=' + lat 
    + '&location.within=35mi&expand=venue', function(res) {

    console.log(res.events.length);

    if(res.events.length) {
      for(var i = 0; i < 5; i++) {
        var event = res.events[i];

        if (i < 3)
        	addToMinis(event);

        makeCard(event);

        console.dir(event);
      }
    }
  });

  $.get('https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=' + flickrAPIKey 
    + '&lat=' + lat 
    + '&lon=' + lng 
    + '&radius=32&text=nature&format=json&nojsoncallback=1', function(res) {

    // console.log(res.events.length);

    // if(res.events.length) {
    //   // var s = "<ul class='eventList'>";
    //   for(var i = 0; i < 4; i++) {
    //     var event = res.events[i];

    //     // makeCard(event);

    //https://farm{farm-id}.staticflickr.com/{server-id}/{id}_{secret}.jpg
      for (let i = 0; i < 20; i++){
        let flickrImageURL = ('https://farm' + res.photos.photo[i].farm + '.staticflickr.com/' +  res.photos.photo[i].server + '/' + res.photos.photo[i].id + '_' + res.photos.photo[i].secret + '.jpg');
        
        console.log(flickrImageURL);
        addImage(flickrImageURL);
      }
      console.log(res);


    //   }
    // }
  });

}



function addImage(imageURL){

  $('#flickrImages').append('<div class="col-md-6 p-0 imgContainer"><img class="img-responsive flickrImg" src=' + imageURL + '></div>');

}


//Currently designed for Events but can be modified to work for all 3 categories to avoid rewriting
function makeCard(event){

  let eventImageURL;

  //Ensure event still loads even without a Logo Image
  if (event.logo != null && event.logo != undefined)
    eventImageURL = event.logo.url;
  else
    eventImageURL = "#";

	//Prewritten Card with jquery, can modify for Flight/Hotel/Etc
	$('#eventContainer').append('<a class="cardLink" target="_blank" href=' + event.url + '><div class="row"><div class="mb-2 col-md-12">'+
	'<div class="card border-0"><div class="card-body"><div class="row">' +
	'<div class="col-md-2"><img alt="No image :(" src="' + eventImageURL + '"></div>' + //HERE
	'<div class="col-md-10"><div class="row"><h5>' + event.name.text + '</h5></div><div class="row"><div class="col-md-6 p-0"><p>Address: ' 
	+ event.venue.address.city + 
	'</p></div><div class="col-md-6 p-0"><p>Start Time: ' + convertDate(event.start.local) + '</p></div></div>' +
	'<div class="row"><p>' + event.description.text.substring(0,350) + '...  <span>Read More</span></p></div>' +
	'</div></div></div></div></div></div></a>');
}

//Add content to small section tied to map
function addToMinis(event){
	$('#eventMini').append('<div class="miniText"><p><strong>' + event.name.text.substring(0,20) + '...</strong><br>' + event.description.text.substring(0,70) + '...</p></div>')
}

//Clear all content for new selection
function deleteCards(){
  $('.cardLink').remove();
  $('.miniText').remove();
  $('.imgContainer').remove();
}

function convertDate(date) {
    return new Date(date).toLocaleString();
}