const { collection } = require('../models/restaurant');

const express = require('express'),
	app = express.Router(),
	passport = require('passport'),
	bodyParser = require('body-parser'),
	axios = require('axios'),
	Restaurant = require('../models/restaurant'),
	Review = require('../models/review'),
	middleware = require('../middleware'),
	User = require('../models/user'),
	{getCollectionRestautants,getCollections} = require('./restaurants'),
	multer = require('./multer');

localStorage.setItem('alreadyBookmarked',false);

//Bookmark a restaurant
app.post('/:id/bookmark', async (req, res) => {
	let user = {
		id: req.user._id,
		username: req.user.username
	};
	let res_id = req.params.id;
	let newRestaurant = { res_id, user };

	if (await checkIfRestaurantBookmarked(req.user._id, res_id)){
	
		return res.redirect(`/${res_id}/${user.id}/delete`);
		
	}
	Restaurant.create(newRestaurant);

	localStorage.setItem('isBookmarked',true);

	res.redirect(`back`);
});

//bookmark a collection
app.get('/collection/:id/save',async (req,res)=>{

	if (await checkIfCollectionBookmarked(req.user._id, req.params.id)){
	
		return res.redirect(`/collection/${req.params.id}/${req.user._id}/delete`);
		
	}
	User.updateOne({_id:req.user._id},
		{ "$push": { "favCollections": req.params.id } }
		,(err,affected,resp)=>{

		console.log(err);
	});

	localStorage.setItem('isCollectionBookmarked',true);

	res.redirect('back');
})

// delete a bookmarked restaurant
app.get('/:resid/:userid/delete', async (req, res) => {
	
	user_id = req.params.userid;

	let res_id =  req.params.resid;
	
	await Restaurant.deleteOne({ res_id, 'user.id': user_id });

	userFavourites = await findFavourites(user_id);

	localStorage.setItem('alreadyBookmarked',true);

	res.redirect('back');
});

// delete a bookmarked collection
app.get("/collection/:collid/:userid/delete",async (req,res)=>{

	let {favCollections} = await User.findById(req.params.userid).select('favCollections');

	let collectionId = req.params.collid;

	favCollections =  favCollections.filter((coll)=> coll!=collectionId);

	await User.updateOne({_id:req.params.userid},{favCollections});

	localStorage.setItem('alreadyBookmarked',true);

	userFavourites = await findFavourites(req.params.userid);
	
	res.redirect('back');
})

// edit user profile
app.get('/:userid/edit', async (req, res) => {
	let user = await User.findOne({ _id: req.params.userid });


	res.render('edit', { user});
});

app.post('/:userid/edit', multer.upload.single('avatar'), async (req, res, next) => {
	
	let user_id = req.params.userid;

	let oldUser = await User.findById(user_id);
	
	let updatedUser = await User.findOneAndUpdate(
		{ _id: user_id },
		{
			username: req.body.username || oldUser.username,
			firstName: req.body.firstName || oldUser.firstName,
			lastName: req.body.lastName || oldUser.lastName,
			email: req.body.email || oldUser.email,
			contact: req.body.contact || oldUser.contact,
			avatar: (req.file)?`/uploads/${req.file.originalname}`:oldUser.avatar
		},
		{ new: true }
	);
	
	localStorage.setItem('editedAccount',true);

	res.redirect(`/user/${req.params.userid}`);
});

app.get('/user/:id/bookmarks', async (req, res) => {
	let alreadyBookmarked = localStorage.getItem('alreadyBookmarked');

	localStorage.setItem('alreadyBookmarked',false);

	res.render('user', { user, userReviews, favourites: userFavourites, bookmarks: true, reviews: false,alreadyBookmarked });
});


// delete an user's account
app.get('/user/:id/deleteUser',async (req,res)=>{
	user_id = req.params.id;

	await User.deleteOne({_id:user_id},(err,user)=>{
		console.log(`user deleted`);
	});

	localStorage.setItem('deletedAccount',true);

	res.redirect("/");
})

// set user reviews and bookmarked restaurants globally
let userReviews, userFavourites, user, user_id;

app.get('/user/:id', async (req, res) => {
	user_id = req.params.id;

	user = await User.findById(user_id);

	userReviews = await findUserReviews(user_id);

	userFavourites = await findFavourites(user_id);

	alreadyBookmarked = localStorage.getItem('alreadyBookmarked');
	reviewDeleted = localStorage.getItem('reviewDeleted');
	editedAccount = localStorage.getItem('editedAccount');

	localStorage.setItem('alreadyBookmarked',false);
	localStorage.setItem('reviewDeleted',false);
	localStorage.setItem('editedAccount',false);

	res.render('user', { user, userReviews, favourites: userFavourites, bookmarks: false, reviews: true,alreadyBookmarked,reviewDeleted,editedAccount });

});


// helper fn. for finding bookmarked restaurants
async function findFavourites(id) {
	const api = process.env.key;

	const url = 'https://developers.zomato.com/api/v2.1/';

	let url1 = `${url}restaurant?apikey=${api}&res_id=`;

	let favRestIds = await Restaurant.find().where('user.id').equals(id).exec();

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
	
	let {favCollections} = await User.findById(id).select('favCollections');

	
	let latitude = localStorage.getItem('latitude');
	let longitude = localStorage.getItem('longitude');
	
	favCollections = await Promise.all(favCollections.map(async (col)=>{
		let collections = await getCollections(latitude, longitude);

		console.log(collections);

		let restaurants = collections.filter((item) => item.collection.collection_id == parseInt(col));

	
		let myCollection = restaurants[0].collection;


		return myCollection;
	}))


	if(favRests.length==0 && favCollections.length==0) return {};

	return {favRests,favCollections};
}

async function findUserReviews(id) {
	let user = await User.findById(id);

	let reviews = await Review.find().where('author.id').equals(id).exec();

	return reviews;
}

async function checkIfRestaurantBookmarked(userid, res_id) {
	let bookmarked = await Restaurant.findOne({ res_id, 'user.id': userid });

	return bookmarked ? true : false;
}

async function checkIfCollectionBookmarked(userid, collection_id) {

	let {favCollections} = await User.findById(userid).select('favCollections');

	let bookmarked = favCollections.indexOf(collection_id);

	return (bookmarked!=-1) ? true : false;
}

module.exports = { app, findUserReviews };
