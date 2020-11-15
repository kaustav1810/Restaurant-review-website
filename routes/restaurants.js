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

let entity_id;

app.get('/', (req, res) => {
	res.render('landing');
});

//INDEX-view all restaurants

app.get('/results', (req, res) => {
	let rest = req.query.rest;
	let city = req.query.city;
	// let entity_id;
	let entity;

	let url1 = `${url}locations?query=${city}&apikey=${api}`;
	//refactored
	axios
		.get(url1)
		.then((body) => {
			entity = body.data;
			entity_id = entity.location_suggestions[0].entity_id;

			url1 = `${url}search?entity_id=${entity_id}
		&entity_type=${city}&count=6&q=${rest}&apikey=${api}`;

			axios
				.get(url1)
				.then((body) => {
					let data = body.data;

					res.render('index', { data });
				})
				.catch((err) => {
					console.log(err);
				});
		})
		.catch((err) => {
			console.log(err);
		});
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
