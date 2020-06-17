var express = require("express");
var app		= express.Router();
var passport = require("passport");
var Review	 = require("../models/review");
var Restaurant	 = require("../models/restaurant");
var middleware = require("../middleware");


//CREATE-create a review and add to the particular restaurant
app.post("/:id/review",(req,res)=>{
		Review.create(req.body.comment,(err,newReview)=>{
		if(err)
			console.log(err);
		else{
			newReview.author.id=req.user._id;
			newReview.author.username=req.user.username;
			newReview.rest_id = req.params.id;
			newReview.save();
			// foundRestaurant.reviews.push(newReview);
			// foundRestaurant.save();
			res.redirect("/"+req.params.id+"/details");
		}
		});	
});

module.exports = app;