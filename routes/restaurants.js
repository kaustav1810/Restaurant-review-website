var express = require("express");
var app		= express.Router();
var passport = require("passport");
var rp		 = require("request-promise");
var bodyParser = require("body-parser");
var Restaurant	 = require("../models/restaurant");
var middleware = require("../middleware");

// app.set("view engine","ejs");
// app.use(bodyParser.urlencoded({extended:true}));

var api = "8387e6e78ff3348550e50d77718d1f6b";
	
var url = "https://developers.zomato.com/api/v2.1/";


app.get("/",(req,res)=>{
	res.render("landing");
})

//INDEX-view all restaurants

app.get("/results",(req,res)=>{
	var rest = req.query.rest;
	var city = req.query.city;
	
	var url1=url+"search?apikey="+api+"&entity_type=city&count=6"+"&q="+rest;
	
	var url4 = url+"cities?"+"apikey="+api+"&count=5"+"&q="+city;
	
	Promise.all([rp({uri: url1,json:true}),rp({uri:url4,json:true})]).then(([data,city])=>{
		res.render("index",{data,city});
	}).catch(err=>{
		console.log(err);
		res.sendStatus(500);
	});
	
});


//SHOW-show details of a restaurant
app.get("/:id/details",(req,res)=>{
	var res_id = req.params.id;
	var url2=url+"restaurant?"+"apikey="+api+"&res_id="+res_id;
	
	var url3 = url+"reviews?"+"apikey="+api+"&res_id="+res_id;
	
	
Promise.all([rp({uri: url2, json:true}), rp({uri: url3, json:true})]).then(([Restaurant, review,menu]) => {
      res.render('show', {Restaurant,review,menu});
  }).catch(err => {
      console.log(err);
      res.sendStatus(500);
  });
});

//Bookmark a restaurant
app.post("/:id/:name/bookmark",(req,res)=>{
		
		var user={
			 id : req.user._id,
			 username : req.user.username
		}
		var res_id = req.params.id;
		var name = req.params.name;
		var newRestaurant = {res_id:res_id,user:user,name:name};
		
		Restaurant.create(newRestaurant);
		
		console.log("Success");
		res.redirect("/"+req.params.id+"/details");
	
});

module.exports = app;