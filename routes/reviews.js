const express = require('express'),
 app = express.Router(),
 passport = require('passport'),
 Review = require('../models/review'),
 User = require('../models/user'),
 Restaurant = require('../models/restaurant'),
 middleware = require('../middleware'),
 Axios = require('axios');

//CREATE-create a review and add to the particular restaurant
app.post('/:id/review', async (req, res) => {
	let author = {
		id: req.user._id,
		username: req.user.username
	};

	let rest_id = req.params.id;

	let text = req.body.comment;

	let rest_name;

	const api = process.env.key;

	const url = `https://developers.zomato.com/api/v2.1/restaurant?apikey=${api}&res_id=${rest_id}`;

	await Axios.get(url)
		.then((body) => {
			rest_name = body.data.name;
		})
		.catch((err) => {
			console.log(err);
		});

	let newReview = { author: author, rest_id: rest_id, text: text, rest_name: rest_name };

	Review.create(newReview);

	let foundUser = await User.findById(req.user._id);

		let userReview = {
			id:newReview._id,
			text:newReview.text,
			rest_id:newReview.rest_id,
			rest_name:newReview.rest_name
		};
		
		foundUser.Reviews.push(userReview);
		foundUser.save();
	res.redirect('/' + req.params.id + '/details');
});

module.exports = app;
