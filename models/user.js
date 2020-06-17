var mongoose 				= require("mongoose");
var	passportLocalMongoose	= require("passport-local-mongoose");

//user schema
var userSchema = new mongoose.Schema({
	username:{type:String,unique:true,require:true},
	password:{type:String,unique:true,require:true},
	firstName:String,
	lastName:String,
	email:{type:String,unique:true,require:true},
	contact:String,
	resetPasswordToken: String,
    resetPasswordExpires: Date,
	Avatar:String
})

userSchema.plugin(passportLocalMongoose);

var User = mongoose.model("User",userSchema);


module.exports = User;