
function getLocation() {
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(showPosition,
			error => console.log(error),
			{enableHighAccuracy:true});
	} else {
		console.log('Geolocation is not supported by this browser.');
	}
}

let latitude,longitude;

async function showPosition(position) {
	
	latitude = position.coords.latitude;
	longitude = position.coords.longitude;

	let mapToken;

	await axios.get("/getMapToken")
	.then(({data})=>mapToken = data)
	.catch((err)=>console.log(err));

	const getLocationURL = `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${mapToken}`;

	let city,state;

	await axios.get(getLocationURL)
	.then(({data})=>{
		city = data.features[0].context[1].text;
		state = data.features[0].context[3].text;
	})
	.catch((err)=> console.log(err));

	document.querySelector('.dropdown-location').innerHTML = `${city},${state}`;
	
	document.querySelector('#city').value = `${latitude},${longitude}`;

	axios({
		method: 'get',
		url: `/getCoords/${latitude}/${longitude}`,
	  });
}

getLocation();


document.querySelector('.dropdown-item').addEventListener('click',()=>{
	getLocation();		
})

module.export = {getLocation}
