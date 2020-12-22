require("dotenv").config();
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth2').Strategy;
const User = require('../models/user');

passport.serializeUser(function(user, done) {
	/*
    From the user take just the id (to minimize the cookie size) and just pass the id of the user
    to the done callback
    PS: You dont have to do it like this its just usually done like this
    */
	done(null, user.id);
});
passport.deserializeUser((id, done) => {
	User.findById(id).then((user) => {
		done(null, user);
	});
});

passport.use(
	new GoogleStrategy(
		{
			clientID: process.env.GOOGLE_CLIENT_ID,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET,
			callbackURL: 'http://localhost:3000/auth/google/callback'
		},
		function(accessToken, refreshToken, profile, done) {
			/*
     use the profile info (mainly profile id) to check if the user is registerd in ur db
     If yes select the user and pass him to the done callback
     If not create the user and then select him and pass to callback
    */
			User.findOne({ googleId: profile.id }).then((currentUser) => {
				if (currentUser) {
					// console.log(profile);
					//if we already have a record with the given profile ID
					done(null, currentUser);
				} else {
					//if not, create a new user
					new User({
						googleId: profile.id,
						firstName: profile.given_name,
						lastName: profile.family_name,
						email: profile.email
					})
						.save()
						.then((newUser) => {
							done(null, newUser);
						});
				}
			});
		}
	)
);
