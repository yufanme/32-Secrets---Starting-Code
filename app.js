require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
// const encrypt = require('mongoose-encryption');
const dotenv = require('dotenv').config();
// const md5 = require('md5');
// const SHA256 = require('crypto-js/sha256');
// const bcrypt = require('bcrypt');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');

const app = express();
const port = process.env.PORT || 3000;
// const secret = process.env.SECRET;
// const saltRounds = 10;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.set('view engine', 'ejs');

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: true }
  }));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect('mongodb://localhost:27017/userDB');
const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

userSchema.plugin(passportLocalMongoose);

// userSchema.plugin(encrypt, {secret: secret, encryptedFields: ['password']});
const User = mongoose.model('User', userSchema);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get('/', function(req, res) {
    res.render('home');
});

app.get('/login', function(req, res) {
    res.render('login');
});



app.get('/register', function(req, res) {
    res.render('register');
});

app.get("/secrets", function(req, res) {
    if (req.isAuthenticated){
        console.log("authenticated!");
        res.render('secrets');
    } else {
        res.render("login");
    }
});

app.get("/logout", function(req, res) {
    req.logOut(function(err) {
        if (err) {
            console.log(err);
        } else {
            console.log("logout!");
            res.redirect("/");
        }
    });
});

// app.post('/register', function(req, res) {
//     const email = req.body.username;
//     // const password = md5(req.body.password);
//     // const password = SHA256(req.body.password);
//     bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
//         if (!err) {
//             const newUser = new User({
//                 email: email,
//                 password:  hash
//             });
//             newUser.save(function(err){
//                 if (!err) {
//                     res.render('secrets');
//                 }
//             });
//         }
//     });
// });

app.post('/register', function(req, res) {
    User.register({username: req.body.username}, req.body.password, function(err, user) {
        if (err) {
            console.log(err);
            res.render("/register");
        } else {
            passport.authenticate("local")(req, res, function(){
                res.redirect("/secrets");
            });
        }
    });
});

// app.post("/login", function(req, res) {
//     const email = req.body.username;
//     const password = req.body.password;
//     // const password = md5(req.body.password);
//     // const password = SHA256(req.body.password);
//     User.findOne({email: email}, function(err, foundUser) {
//         if (err) {
//             console.log(err);
//         } else {
//             if (foundUser) {
//                 bcrypt.compare(password, foundUser.password, function(err, result) {
//                     if (!err) {
//                         if (result === true) {
//                             console.log("OK");
//                             res.render('secrets');
//                         }
//                     } else {
//                         console.log(err);
//                     }
//                 });
//                 // if (foundUser.password === password) {
//                 //     res.render('secrets');
//                 // } else {
//                 //     console.log('password does not match');
//                 // }
//             }
//         }
//     })
// });

// app.post("/login", passport.authenticate("local", {failureRedirect: "/"}), function(req, res){

//     const user = new User({
//         username: req.body.username,
//         password: req.body.password
//     });

//     req.login(user, function(err){
//         if (err) {
//             console.log(err);
//         } else {
//             res.redirect('/secrets');
//         }
//     });
// });
app.post('/login', passport.authenticate('local', { 
    successRedirect: '/secrets',
    failureRedirect: '/login' 
    })
);

app.listen(port, function(){
    console.log('listening on port ' + port);
});