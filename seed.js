const Restaurant = require("./models/restaurant");
const Review = require("./models/review");
const User = require("./models/user");

function seedDB(){
	Restaurant.deleteMany({},(err)=>{
		if(err)
			console.log("cannot delete reataurants!!");
		else{
			console.log("restaurant deleted");
			Review.deleteMany({},(err)=>{
				if(err)
					console.log(err)
				else
					console.log("review removed");
			})
		}
	})

	User.deleteMany({},(err)=>{
		if(err) console.log("cannot delete users!!");

		else console.log("Users deleted!!");
	})
}

module.exports=seedDB;