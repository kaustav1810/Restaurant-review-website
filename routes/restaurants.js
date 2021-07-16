require('dotenv').config();

const express = require('express'),
	app = express.Router(),
	passport = require('passport'),
	rp = require('request-promise'),
	bodyParser = require('body-parser'),
	Restaurant = require('../models/restaurant'),
	middleware = require('../middleware'),
	axios = require('axios'),
	User = require('../models/user'),
	{ collection } = require('../models/restaurant'),
	api = process.env.key,
	url = 'https://developers.zomato.com/api/v2.1/';

let entity_id, rest, city, url1, latitude, longitude;
var MyRestaurant;

localStorage.setItem('isBookmarked', false);
localStorage.setItem('isCollectionBookmarked', false);
localStorage.setItem('alreadyBookmarked', false);

app.get('/', async (req, res) => {
	let collections = await getCollections(latitude, longitude);

	let loggedIn = localStorage.getItem('loggedIn');
	let loggedOut = localStorage.getItem('loggedOut');
	let deletedAccount = localStorage.getItem('deletedAccount');

	res.render('landing', { collections, loggedIn, loggedOut, deletedAccount });

	localStorage.setItem('loggedIn', false);
	localStorage.setItem('loggedOut', false);
	localStorage.setItem('deletedAccount', false);
});

app.get('/getCoords/:lat/:long', async (req, res) => {
	latitude = req.params.lat;
	longitude = req.params.long;

	// let collections = await getCollections(latitude,longitude);

	// let loggedIn = localStorage.getItem("loggedIn");
	// let loggedOut = localStorage.getItem("loggedOut");

	// res.render('landing', { collections,loggedIn,loggedOut });

	localStorage.setItem("latitude",latitude);
	localStorage.setItem("longitude",longitude);


	res.redirect('/');
});

// view a particular collection
app.get('/collection/:id', async (req, res) => {
	let collection_id = req.params.id;

	let { restaurants, myCollection } = await getCollectionRestaurants(collection_id);

	let isBookmarked = localStorage.getItem('isBookmarked');
	let isCollectionBookmarked = localStorage.getItem('isCollectionBookmarked');
	let alreadyBookmarked = localStorage.getItem('alreadyBookmarked');

	localStorage.setItem('isBookmarked', false);
	localStorage.setItem('isCollectionBookmarked', false);
	localStorage.setItem('alreadyBookmarked', false);
	res.render('index', { restaurants, myCollection, isBookmarked,isCollectionBookmarked, alreadyBookmarked });
});
//INDEX-view all restaurants
app.get('/results', (req, res) => {
	rest = req.query.rest;

	let entity;

	coords = req.query.city.split(',');

	url1 = `${url}cities?lat=${coords[0]}&lon=${coords[1]}&apikey=${api}`;

	let isBookmarked = localStorage.getItem('isBookmarked');
	let alreadyBookmarked = localStorage.getItem('alreadyBookmarked');

	localStorage.setItem('isBookmarked', false);
	localStorage.setItem('alreadyBookmarked', false);

	axios
		.get(url1)
		.then((body) => {
			entity_id = body.data.location_suggestions[0].id;

			url1 = `${url}search?entity_id=${entity_id}&q=${city}&entity_type=city&count=30&q=${rest}&apikey=${api}`;

			console.log(url1);
			
			axios
				.get(url1)
				.then((body) => {
					let restaurants = body.data.restaurants;

					res.render('index', { restaurants, myCollection: null, alreadyBookmarked, isBookmarked
					 });
				})
				.catch((err) => {
					console.log(err);
				});
		})
		.catch((err) => {
			console.log(err);
		});
});

// view sorted results
app.get('/results/sorted', (req, res) => {
	let filterBy = req.query.filter;

	console.log(filterBy);

	url1 = `${url1}&sort=${filterBy.split(' ')[0]}`;

	let isBookmarked = localStorage.getItem('isBookmarked');
	let alreadyBookmarked = localStorage.getItem('alreadyBookmarked');

	localStorage.setItem('isBookmarked', false);
	localStorage.setItem('alreadyBookmarked', false);

	axios
		.get(url1)
		.then((body) => {
			let restaurants = filterBy == 'cost asc' ? body.data.restaurants.reverse() : body.data.restaurants;

			res.render('index', { restaurants, isBookmarked, alreadyBookmarked });
		})
		.catch((e) => console.log('filter error!!!'));
});


//SHOW-show details of a restaurant
app.get('/:id/details', (req, res) => {
	let res_id = req.params.id;
	let url2 = `${url}restaurant?apikey=${api}&res_id=${res_id}`;

	let url3 = `${url}reviews?apikey=${api}&res_id=${res_id}`;

	let isBookmarked = localStorage.getItem('isBookmarked');
	let alreadyBookmarked = localStorage.getItem('alreadyBookmarked');
	let isReviewed = localStorage.getItem('isReviewed');

	Promise.all([ rp({ uri: url2, json: true }), rp({ uri: url3, json: true }) ])
		.then(([ Restaurant, review, menu ]) => {
			res.render('show', { Restaurant, review, menu, isBookmarked, alreadyBookmarked, isReviewed });
			localStorage.setItem('isBookmarked', false);
			localStorage.setItem('alreadyBookmarked', false);
			localStorage.setItem('isReviewed', false);
		})
		.catch((err) => {
			console.log(err);
			res.sendStatus(500);
		});
});

// helper functions
async function getCollections(lat, long) {
	if (lat == undefined && long == undefined) return [];

	const collection_url = `${url}collections?apikey=${api}&lat=${lat}&lon=${long}&count=6`;

	let collections;

	await axios
		.get(collection_url)
		.then((body) => {
			collections = [ ...body.data.collections ];
		})
		.catch((err) => console.log('error!!!!!!!!!!'));

	return collections;
}

async function getCollectionRestaurants(collection_id) {
	
	latitude = localStorage.getItem('latitude');
	longitude = localStorage.getItem('longitude');
	
	let collections = await getCollections(latitude, longitude);

	console.log(collections,latitude,longitude)

	let restaurants = collections.filter((item) => item.collection.collection_id == collection_id);

	
	let myCollection = restaurants[0].collection;
	

	let url = `https://developers.zomato.com/api/v2.1/search?collection_id=${collection_id}&apikey=${api}`;

	await axios.get(url).then((body) => (restaurants = body.data.restaurants)).catch(() => console.log(error));

	return { restaurants, myCollection };
}

module.exports = {app,getCollectionRestaurants,getCollections};
