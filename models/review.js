var mongoose = require("mongoose");

//review schema
var reviewSchema = new mongoose.Schema({
	author:{
		id:{
			type:mongoose.Schema.Types.ObjectId,
			ref:"User"
		},
		username:String
	},
	text:String,
	rest_id:String
});

var Review	   = mongoose.model("Review",reviewSchema);

module.exports = Review;