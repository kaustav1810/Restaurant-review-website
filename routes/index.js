require("dotenv").config();
var express = require("express");
var app		= express.Router();
var passport = require("passport");
var User	 = require("../models/user");
var Restaurant  = require("../models/restaurant");
var middleware = require("../middleware");
var async = require("async");
var nodemailer  = require("nodemailer");
var crypto = require("crypto");


//================
//AUTH ROUTES
//================

//show signup form
app.get("/register",(req,res)=>{
	res.render("register");	
})

//handle signup logic
app.post("/register",(req,res)=>{
	
	var newUser = new User(req.body);
	
	User.register(newUser,req.body.password,(err,user)=>{
		if(err)
			console.log(err);
		else{
			passport.authenticate("local")(req,res,()=>{
				res.redirect("/");	
			})
		}
	})
})

//=============
// handle password reset
//=============

app.get('/forgot', function(req, res) {
  res.render('forgot');
});

app.post('/forgot', function(req, res, next) {
  async.waterfall([
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
        text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          'http://' + req.headers.host + '/reset/' + token + '\n\n' +
          'If you did not request this, please ignore this email and your password will remain unchanged.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        console.log('mail sent');
        done(err, 'done');
      });
    }
  ], function(err) {
    if (err) return next(err);
    res.redirect('/forgot');
  });
});

app.get('/reset/:token', function(req, res) {
  User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
    if (!user) {
          // req.send('Password reset token is invalid or has expired.');
      return res.redirect('/forgot');
    }
    res.render('reset', {token: req.params.token});
  });
});

app.post('/reset/:token', function(req, res) {
  async.waterfall([
    function(done) {
      User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        if (!user) {
          // req.send('Password reset token is invalid or has expired.');
          return res.redirect('back');
        }
        if(req.body.password === req.body.confirm) {
          user.setPassword(req.body.password, function(err) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;

            user.save(function(err) {
              req.logIn(user, function(err) {
                done(err, user);
              });
            });
          })
        } else {
            // req.send("Passwords do not match.");
            return res.redirect('back');
        }
      });
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
        text: 'Hello,\n\n' +
          'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
      };
      smtpTransport.sendMail(mailOptions, function(err) {
        done(err);
      });
    }
  ], function(err) {
    res.redirect('/');
  });
});


// show user's profile page
app.get("/user/:id",(req,res)=>{
	User.findById(req.params.id,(err,newUser)=>{
		if(err){
			console.log("user not found:(")
			res.redirect("/")
		}
	Restaurant.find().where('user.id').equals(newUser._id).exec((err,newRestaurant)=>{
		
		if(err){
			console.log("user not found:(")
			res.redirect("/")
		}
		res.render("user",{user:newUser,restaurant:newRestaurant});
	})
	})
})


//show login form
app.get("/login",(req,res)=>{
	res.render("login");	
})

//handle login request
app.post('/login',
  passport.authenticate('local', 
		{ successRedirect: '/',
          failureRedirect: '/login'
          })
);

//handle logout request
app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

module.exports = app;
