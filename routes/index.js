require('dotenv').config();
const express = require('express'),
	mapToken = process.env.MAPBOX_TOKEN,
	app = express.Router(),
	passport = require('passport'),
	User = require('../models/user'),
	Restaurant = require('../models/restaurant'),
	Review = require('../models/review'),
	middleware = require('../middleware'),
	async = require('async'),
	axios = require('axios'),
	nodemailer = require('nodemailer'),
	crypto = require('crypto'),
	multer = require('./multer');

	
require('./google-api');

if (typeof localStorage === "undefined" || localStorage === null) {
	let LocalStorage = require('node-localstorage').LocalStorage;
	localStorage = new LocalStorage('./scratch');
  }

  localStorage.setItem("loggedIn",false)
  localStorage.setItem("loggedOut",false)

// Initializes passport and passport sessions
app.use(passport.initialize());
app.use(passport.session());

//================
//AUTH ROUTES
//================

//show signup form
app.get('/register', (req, res) => {
	res.render('register');
});

//handle signup logic
app.post('/register', multer.upload.single('avatar'), async (req, res, next) => {
	var newUser = await new User(req.body);

	newUser.avatar = req.file ? `/uploads/${req.file.originalname}` : `/uploads/profile.png`;

	await User.register(newUser, req.body.password);

	passport.authenticate('local')(req, res, () => {
		res.redirect('/');
	});
});

// use google oAuth authentication
app.get(
	'/auth/google',
	passport.authenticate('google', {
		scope: [ 'email', 'profile' ]
	})
);

app.get(
	'/auth/google/callback',
	passport.authenticate('google', {
		// successRedirect: '/',
		failureRedirect: '/'
	}),(req,res)=>{
		localStorage.setItem("loggedIn",true)
		res.redirect("/");
	}
);

//=============
// handle password reset
//=============

app.get('/forgot', (req, res) => {
	res.render('forgot');
});

app.post('/forgot', function(req, res, next) {
	async.waterfall(
		[
			function(done) {
				crypto.randomBytes(20, function(err, buf) {
					var token = buf.toString('hex');
					done(err, token);
				});
			},
			function(token, done) {
				User.findOne({ email: req.body.email }, function(err, user) {
					if (!user) {
						// req.send('No account with that email address exists.');
						return res.redirect('/forgot');
					}

					user.resetPasswordToken = token;
					user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

					user.save(function(err) {
						done(err, token, user);
					});
				});
			},
			function(token, user, done) {
				var smtpTransport = nodemailer.createTransport({
					service: 'Gmail',
					auth: {
						user: 'kaustav123.kb@gmail.com',
						pass: process.env.pass
					}
				});
				var mailOptions = {
					to: user.email,
					from: 'kaustav123.kb@gmail.com',
					subject: 'Node.js Password Reset',
					text:
						'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
						'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
						'http://' +
						req.headers.host +
						'/reset/' +
						token +
						'\n\n' +
						'If you did not request this, please ignore this email and your password will remain unchanged.\n'
				};
				smtpTransport.sendMail(mailOptions, function(err) {
					console.log('mail sent');
					done(err, 'done');
				});
			}
		],
		function(err) {
			if (err) return next(err);
			res.redirect('/forgot');
		}
	);
});

app.get('/reset/:token', function(req, res) {
	User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(
		err,
		user
	) {
		if (!user) {
			// req.send('Password reset token is invalid or has expired.');
			return res.redirect('/forgot');
		}
		res.render('reset', { token: req.params.token });
	});
});

app.post('/reset/:token', function(req, res) {
	async.waterfall(
		[
			function(done) {
				User.findOne(
					{ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } },
					function(err, user) {
						if (!user) {
							// req.send('Password reset token is invalid or has expired.');
							return res.redirect('back');
						}
						if (req.body.password === req.body.confirm) {
							user.setPassword(req.body.password, function(err) {
								user.resetPasswordToken = undefined;
								user.resetPasswordExpires = undefined;

								user.save(function(err) {
									req.logIn(user, function(err) {
										done(err, user);
									});
								});
							});
						} else {
							// req.send("Passwords do not match.");
							return res.redirect('back');
						}
					}
				);
			},
			function(user, done) {
				var smtpTransport = nodemailer.createTransport({
					service: 'Gmail',
					auth: {
						user: 'kaustav123.kb@gmail.com',
						pass: process.env.pass
					}
				});
				var mailOptions = {
					to: user.email,
					from: 'kaustav123.kb@gmail.com',
					subject: 'Your password has been changed',
					text:
						'Hello,\n\n' +
						'This is a confirmation that the password for your account ' +
						user.email +
						' has just been changed.\n'
				};
				smtpTransport.sendMail(mailOptions, function(err) {
					done(err);
				});
			}
		],
		function(err) {
			res.redirect('/');
		}
	);
});

//handle map token req
app.get('/getMapToken', (req, res) => {
	res.send(mapToken);
});
//handle login request
// app.post(
// 	'/login',
// 	passport.authenticate('local', {
// 		successRedirect: '/',
// 		failureRedirect: '/login'
// 	})
// );

// app.get(
// 	'/login',
// 	passport.authenticate('local'),
// 	(req,res)=>{
// 		localStorage.setItem('loggedIn',true);
// 		res.redirect("/");
// 	}
// );

app.get('/login', function(req, res, next) {
	passport.authenticate('local', function(err, user, info) {
	  if (err){
		   return next(err); 
	  }
	  
			
	  if (!user) {
			req.session.error = 'invalid username/password';
		  return res.redirect('back'); 
	  }
	  

	  req.logIn(user, function(err) {
		if (err){
			console.log('|RAY|3');
			//  return next(err);
		}
		localStorage.setItem('loggedIn',true);

		return res.redirect('/');
	  });
	})(req, res, next);
  });

//handle logout request
app.get('/logout', (req, res) => {
	req.session.destroy();
	req.logout();
	localStorage.setItem("loggedOut",true);
	res.redirect('/');
});

module.exports = app;
