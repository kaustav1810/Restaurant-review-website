const express = require('express'),
 app = express.Router(),
 passport = require('passport'),
 Review = require('../models/review'),
 User = require('../models/user'),
 Restaurant = require('../models/restaurant'),
 middleware = require('../middleware'),
 Axios = require('axios'),
 userReview = require('./user')


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

	let newReview = { author, rest_id, text, rest_name };
	
	if(await isReviewed(req.user._id,rest_id)){
		await Review.findOneAndUpdate({'author.id':req.user._id,rest_id},{
			rest_name,
			text
		})
	}
	else
	Review.create(newReview);

	localStorage.setItem('isReviewed',true);

	res.redirect('/' + req.params.id + '/details');
});

// delete a user review
app.get('/:resid/:userid/reviews/delete', async (req, res) => {
    
	let rest_id = req.params.resid;

	let user_id = req.params.userid;
	
	await Review.findOneAndDelete({'author.id':user_id,rest_id});

	userReviews = await userReview.findUserReviews(user_id);

	localStorage.setItem('reviewDeleted',true);
	
	res.redirect(`/user/${user_id}`);
});


async function isReviewed(userid,resid) {
	
	let reviewed = await Review.findOne({'author.id':userid,rest_id:resid});

	return reviewed?true:false;
}

module.exports = app;
