var mongoose = require("mongoose");

//restaurant schema
var restSchema = new mongoose.Schema({
	res_id:String,
	name:String,
	user:{
		id:{
		type:mongoose.Schema.Types.ObjectId,
		ref:"User"
	},
	username:String
	}
})

var Restaurant = mongoose.model("Restaurant",restSchema);

module.exports = Restaurant;