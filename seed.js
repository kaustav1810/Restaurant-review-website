var Restaurant = require("./models/restaurant");
var Review = require("./models/review");

function seedDB(){
	Restaurant.deleteMany({},(err)=>{
		if(err)
			console.log(err);
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
}

module.exports=seedDB;