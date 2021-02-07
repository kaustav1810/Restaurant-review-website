const express = require('express'),
 app = express.Router(),
 passport = require('passport'),
 bodyParser = require('body-parser'),
 Restaurant = require('../models/restaurant'),
 middleware = require('../middleware'),
 User = require('../models/user'),
 multer = require('./multer');

//Bookmark a restaurant
app.post('/:id/:name/bookmark', (req, res) => {
	let user = {
		id: req.user._id,
		username: req.user.username
	};
	let res_id = req.params.id;
	let name = req.params.name;
	let newRestaurant = { res_id: res_id, user: user, name: name };

	Restaurant.create(newRestaurant);

	console.log('Success');
	res.redirect('/' + req.params.id + '/details');
});

// delete a bookmarked restaurant
app.get('/:resid/:userid/delete', async(req, res) => {
    
    await Restaurant.deleteOne({ res_id: req.params.resid, 'user.id': req.params.userid});
    
    console.log('successfully deleted!!!');

	res.redirect(`/user/${req.params.userid}`);
});

// delete a user review
app.get('/:resid/:userid/reviews/delete', async (req, res) => {
    let user = await User.findOne({ _id: req.params.userid });
    
    let newReviews = user.Reviews.filter((review) => review.rest_id !== req.params.resid);

    user.Reviews = newReviews;

    user.save();

	res.redirect(`/user/${req.params.userid}`);
});

// show user's profile page
app.get("/user/:id",async (req,res)=>{
	
    let newUser = await User.findById(req.params.id);
		
	Restaurant.find().where('user.id').equals(newUser._id).exec((err,newRestaurant)=>{
    
    res.render("user",{user:newUser,restaurant:newRestaurant});
    
	})
})
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
			avatar:`/uploads/${req.file.originalname}`
		},
		{ new: true }
	);

	res.redirect(`/user/${req.params.userid}`);
});

module.exports = app;
