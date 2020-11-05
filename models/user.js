var mongoose 				= require("mongoose");
var	passportLocalMongoose	= require("passport-local-mongoose");
const Review = require("./review");

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
	coverImage: {
		type: Buffer,
		required: true
	  },
	  coverImageType: {
		type: String,
		required: true
	  },
	Reviews:[
		{
			id:{
				type:mongoose.Schema.Types.ObjectId,
				ref:"Review"
			},
			text:String,
			rest_id:String,
			rest_name:String
		}
	]
})

userSchema.virtual('coverImagePath').get(function() {
	if (this.coverImage != null && this.coverImageType != null) {
	  return `data:${this.coverImageType};charset=utf-8;base64,${this.coverImage.toString('base64')}`
	}
  })
userSchema.plugin(passportLocalMongoose);

var User = mongoose.model("User",userSchema);


module.exports = User;