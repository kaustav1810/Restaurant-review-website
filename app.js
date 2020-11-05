var express  				= require("express"),
	app		 				= express(),
	bodyParser 				= require("body-parser"),
	mongoose				= require("mongoose"),
	methodOverride			= require("method-override"),
	passport				= require("passport"),
	localStrategy			= require("passport-local"),
	passportLocalMongoose	= require("passport-local-mongoose"),
	expressSession			= require("express-session"),
    User					= require("./models/user"),
	seedDB					= require("./seed");

// seedDB();
//importing different ROUTES
var indexRoutes = require("./routes/index");
var reviewRoutes     = require("./routes/reviews");
var restaurantRoutes = require("./routes/restaurants");


app.set("view engine","ejs");
app.use(bodyParser.urlencoded({limit: '200mb',extended:true}));
app.use(express.static("public"));
app.use(methodOverride("_method"));
mongoose.set("useUnifiedTopology",true);
mongoose.connect("mongodb://localhost:27017/restaurants",{useNewUrlParser: true});

//================
//PASSPORT CONFIG
//================
app.use(expressSession({
	secret:"privacy is a myth",
	resave:false,
	saveUninitialized:false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use((req,res,next)=>{
	res.locals.currentUser=req.user;
	next();
})


// HOME PAGE
app.get("/",(req,res)=>{
	res.render("landing");
})

app.use(indexRoutes,restaurantRoutes,reviewRoutes);

app.listen(3000,()=>{
	console.log("server started!!");
})