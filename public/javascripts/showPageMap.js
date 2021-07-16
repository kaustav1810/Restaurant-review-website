let myLong,myLat;

let directionBtn = document.getElementById('directionBtn');

mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
	container: 'map',
	style: 'mapbox://styles/mapbox/streets-v11', // stylesheet location
	center: [ long,lat], // starting position [lng, lat]
	zoom: 15 // starting zoom
});

const marker = new mapboxgl.Marker().setLngLat([ long, lat ]).addTo(map);

// Add geolocate control to the map.
map.addControl(
	new mapboxgl.GeolocateControl({
		positionOptions: {
			enableHighAccuracy: true
		},
		trackUserLocation: true
	})
	.on('geolocate', function(e) {
		myLong = e.coords.longitude;
		myLat = e.coords.latitude
		const position = [myLong, myLat];
		getRoute([long,lat]);
  })

);

// show directions when clicked on button
directionBtn.addEventListener('click',()=>{
	navigator.geolocation.getCurrentPosition(position => {
		const userCoordinates = [position.coords.longitude, position.coords.latitude];
		myLong = position.coords.longitude;
		myLat = position.coords.latitude;
		getRoute([long,lat]);
})
})

// create a function to make a directions request
async function getRoute(end) {
	// make a directions request using cycling profile
	// an arbitrary start will always be the same
	// only the end or destination will change
	const start = [myLong,myLat];
	const url = 
`https://api.mapbox.com/directions/v5/mapbox/driving/${start[0]},${start[1]};${end[0]},${end[1]}?steps=true&geometries=geojson&access_token=${mapboxgl.accessToken}`;
	
	// make an XHR request https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest
	const req = await new XMLHttpRequest();
	req.open('GET', url, true);
	req.onload = function() {
	  const json = JSON.parse(req.response);
	  const data = json.routes[0];
	  const route = data.geometry.coordinates;
	  const geojson = {
		type: 'Feature',
		properties: {},
		geometry: {
		  type: 'LineString',
		  coordinates: route
		}
	  };
	  // if the route already exists on the map, reset it using setData
	  if (map.getSource('route')) {
		map.getSource('route').setData(geojson);
	  } else { // otherwise, make a new request
		map.addLayer({
		  id: 'route',
		  type: 'line',
		  source: {
			type: 'geojson',
			data: {
			  type: 'Feature',
			  properties: {},
			  geometry: {
				type: 'LineString',
				coordinates: geojson
			  }
			}
		  },
		  layout: {
			'line-join': 'round',
			'line-cap': 'round'
		  },
		  paint: {
			'line-color': '#3887be',
			'line-width': 3,
			'line-opacity': 0.75
		  }
		});
	  }
	  // add turn instructions here at the end
	};
	req.send();
  }