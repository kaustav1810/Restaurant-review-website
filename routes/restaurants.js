require('dotenv').config();

const express = require('express');
const app = express.Router();
const passport = require('passport');
const rp = require('request-promise');
const bodyParser = require('body-parser');
const Restaurant = require('../models/restaurant');
const middleware = require('../middleware');
const axios = require('axios');
const User = require('../models/user');

const api = process.env.key;

const url = 'https://developers.zomato.com/api/v2.1/';

let entity_id, rest, city, url1;
var MyRestaurant;

app.get('/', (req, res) => {
	res.render('landing');
});

//INDEX-view all restaurants

app.get('/results', (req, res) => {
	rest = req.query.rest;
	city = req.query.city;
	let entity;

	url1 = `${url}cities?q=${city}&apikey=${api}`;
	
	axios.get(url1).then((body) => {
			entity_id = body.data.location_suggestions[0].id;

			url1 = `${url}search?entity_id=${entity_id}&q=${city}&entity_type=city&count=30&q=${rest}&apikey=${api}`;

			axios.get(url1).then((body) => {
					let restaurants = body.data.restaurants;

					res.render('index', { restaurants });
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

	axios
		.get(url1)
		.then((body) => {
			let restaurants = filterBy == 'cost asc' ? body.data.restaurants.reverse() : body.data.restaurants;

			res.render('index', { restaurants });
		})
		.catch((e) => console.log('filter error!!!'));
});

//SHOW-show details of a restaurant
app.get('/:id/details', (req, res) => {
	let res_id = req.params.id;
	let url2 = `${url}restaurant?apikey=${api}&res_id=${res_id}`;

	let url3 = `${url}reviews?apikey=${api}&res_id=${res_id}`;

	Promise.all([ rp({ uri: url2, json: true }), rp({ uri: url3, json: true }) ])
		.then(([ Restaurant, review, menu ]) => {
			res.render('show', { Restaurant, review, menu });
		})
		.catch((err) => {
			console.log(err);
			res.sendStatus(500);
		});
});
module.exports = app;
