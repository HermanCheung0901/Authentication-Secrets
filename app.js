//jshint esversion:6
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const mongoose = require('mongoose');
const encrypt = require('mongoose-encryption');

const app = express();

console.log(process.env.SECRET)

main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/userDB');
  console.log('Connected to DB.')
};

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});


userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ['password'] });
  
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

app.post('/register', async (req, res) => {
    const newUser = new User({
        email: req.body.username,
        password: req.body.password
    });

    try {
        await newUser.save();
        res.render('secrets');
    } catch(err) {
        console.log(err);
    };
});

app.post('/login', async(req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    try {
        const foundUser = await User.findOne({email: username}).exec();
        console.log(foundUser);
        if (foundUser.password === password) {
            res.render('secrets');
        };
    } catch (err) {
        console.log(err);
    };
});

app.listen(3000, function() {
    console.log('Server started on port 3000.')
});