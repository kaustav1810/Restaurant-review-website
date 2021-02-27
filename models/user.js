var mongoose 				= require("mongoose");
var	passportLocalMongoose	= require("passport-local-mongoose");
const Review = require("./review");

//user schema
var userSchema = new mongoose.Schema({
	googleId:String,
	username:{type:String,unique:true,require:true},
	password:{type:String,unique:true,require:true},
	firstName:String,
	lastName:String,
	email:{type:String,unique:true,require:true},
	contact:String,
	resetPasswordToken: String,
    resetPasswordExpires: Date,
	  avatar:String,
	// Reviews:[
	// 	{
	// 		id:{
	// 			type:mongoose.Schema.Types.ObjectId,
	// 			ref:"Review"
	// 		},
	// 		text:String,
	// 		rest_id:String,
	// 		rest_name:String
	// 	}
	// ]
})

userSchema.plugin(passportLocalMongoose);

var User = mongoose.model("User",userSchema);


module.exports = User;