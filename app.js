//jshint esversion:6
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10;

const app = express();

main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/userDB');
  console.log('Connected to DB.')
};

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});
  
const User = mongoose.model('User', userSchema);

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

app.get('/', (req, res) => {
    res.render('home');
});

app.get('/login', (req, res) => {
    res.render('login');
});

app.get('/register', (req, res) => {
    res.render('register');
});

app.post('/register', (req, res) => {

    bcrypt.hash(req.body.password, saltRounds, async function(err, hash) {
        // Store hash in your password DB.
        const newUser = new User({
            email: req.body.username,
            password: hash
        });
        try {
            await newUser.save();
            res.render('secrets');
        } catch(err) {
            console.log(err);
        };
    });
    
});

app.post('/login', async(req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    try {
        const foundUser = await User.findOne({email: username}).exec();
        bcrypt.compare(password, foundUser.password, function(err, result) {
            // result == true
            if (result === true) {
                res.render("secrets")
            }
        });
    } catch (err) {
        console.log(err);
    };
});

app.listen(3000, function() {
    console.log('Server started on port 3000.')
});