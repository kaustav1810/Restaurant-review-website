const express = require('express'),
	app = express.Router(),
	passport = require('passport'),
	bodyParser = require('body-parser'),
	axios = require('axios'),
	Restaurant = require('../models/restaurant'),
	Review = require('../models/review'),
	middleware = require('../middleware'),
	User = require('../models/user'),
	multer = require('./multer');

//Bookmark a restaurant
app.post('/:id/bookmark', async (req, res) => {
	let user = {
		id: req.user._id,
		username: req.user.username
	};
	let res_id = req.params.id;
	let newRestaurant = { res_id, user };

	if (await isBookmarked(req.user._id, res_id)) return res.redirect(`/${res_id}/details`);

	Restaurant.create(newRestaurant);

	res.redirect(`/${res_id}/details`);
});

// delete a bookmarked restaurant
app.get('/:resid/:userid/delete', async (req, res) => {
	await Restaurant.deleteOne({ res_id: req.params.resid, 'user.id': user_id });

	userFavourites = await findFavourites(user_id);

	res.redirect(`/user/${req.params.userid}`);
});

// edit user profile
app.get('/:userid/edit', async (req, res) => {
	let user = await User.findOne({ _id: req.params.userid });
	res.render('edit', { user });
});

app.post('/:userid/edit', multer.upload.single('avatar'), async (req, res, next) => {
	let updatedUser = await User.findOneAndUpdate(
		{ _id: req.params.userid },
		{
			username: req.body.username,
			firstName: req.body.firstName,
			lastName: req.body.lastName,
			email: req.body.email,
			contact: req.body.contact,
			avatar: `/uploads/${req.file.originalname}`
		},
		{ new: true }
	);

	res.redirect(`/user/${req.params.userid}`);
});

app.get('/user/:id/bookmarks', async (req, res) => {
	res.render('user', { user, userReviews, favourites: userFavourites, bookmarks: true, reviews: false });
});

// set user reviews and bookmarked restaurants globally
let userReviews, userFavourites, user, user_id;

app.get('/user/:id', async (req, res) => {
	user_id = req.params.id;

	user = await User.findById(user_id);

	userReviews = await findUserReviews(user_id);

	userFavourites = await findFavourites(user_id);

	res.render('user', { user, userReviews, favourites: userFavourites, bookmarks: false, reviews: true });
});

// helper fn. for finding bookmarked restaurants
async function findFavourites(id) {
	const api = process.env.key;

	const url = 'https://developers.zomato.com/api/v2.1/';

	let url1 = `${url}restaurant?apikey=${api}&res_id=`;

	let favRestIds = await Restaurant.find().where('user.id').equals(user._id).exec();

	let favRests = [];

	favRests = await Promise.all(
		favRestIds.map(async (rest) => {
			let res_id = rest.res_id;

			let url2 = `${url1}${res_id}`;

			let restaurant;

			await axios
				.get(url2)
				.then((body) => {
					restaurant = {
						name: body.data.name,
						image: body.data.featured_image,
						res_id
					};
				})
				.catch(() => console.log('err'));

			return restaurant;
		})
	);

	return favRests;
}

async function findUserReviews(id) {
	let user = await User.findById(id);

	let reviews = await Review.find().where('author.id').equals(id).exec();

	return reviews;
}

async function isBookmarked(userid, res_id) {
	let bookmarked = await Restaurant.findOne({ res_id, 'user.id': userid });

	return bookmarked ? true : false;
}

module.exports = { app, findUserReviews };
