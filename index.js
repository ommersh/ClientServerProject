const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const session = require('express-session');
const axios = require('axios');
const request = require('request');
const fetch = require('node-fetch');
const Chart = require('chart.js');
const MongoDBStore = require('connect-mongodb-session')(session);
const MONGODB_URI = 'mongodb+srv://vercel-admin-user:SpToSHOYyg6s9dgz@myfirstcluster.wnavi.mongodb.net/mydatabase?retryWrites=true&w=majority';
process.env.MONGODB_URI = MONGODB_URI;

const store = new MongoDBStore({
    uri: process.env.MONGODB_URI,
    collection: 'sessions'
});

store.on('error', (error) => {
    console.error('Session store error:', error);
});

app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: true,
    saveUninitialized: true,
    store: store,
}));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(__dirname + '/css'));
app.use(express.static(__dirname + '/js'));
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/views'));
app.use(express.static(__dirname + '/particles.js-master'));

app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));

var transporter = nodemailer.createTransport({
    service: 'gmail',
    port: 465,

    auth: {
        user: 'forProjectSummer23@gmail.com',
        pass: 'skzmiycrrvybffqw'
    }
});
const axioss = require("axios").default;
const twelvedata = require("twelvedata");


let keyForStock = "9c512d2eb06b44cd8e670a44ce3107d4";





mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch((error) => {
        console.error('Error connecting to MongoDB:', error);
    });

const userSchema = new mongoose.Schema({
    username: String,
    password: String,
    email: String
});

const stockSchema = new mongoose.Schema({
    username: String,
    
});

const User = mongoose.model('User', userSchema);
const Stock = mongoose.model('Stock', stockSchema);

app.get('/', (req, res) => {
    const bodyPageContent = fs.readFileSync(path.join(__dirname, 'views', 'home.html'), 'utf8');

    const data = {
        pageTitle: 'Home',
        bodyPageContent: bodyPageContent,
    };

    res.render('template', { data: data, loggedIn: req.session.loggedIn });
});

app.get('/login', (req, res) => {
    const bodyPageContent = fs.readFileSync(path.join(__dirname, 'views', 'login.html'), 'utf8');

    const data = {
        pageTitle: 'Login Page',
        bodyPageContent: bodyPageContent,
    };
    res.render('template', { data: data, loggedIn: req.session.loggedIn });
});

app.post('/login', (req, res) => {
    User.findOne({ username: req.body.username })
        .then((user) => {
            if (user) {
                bcrypt.compare(req.body.password, user.password)
                    .then((result) => {
                        if (result) {
                            req.session.loggedIn = true;
                            res.json({ success: true });
                        } else {
                            res.json({ success: false, message: 'Invalid username or password' });
                        }
                    })
                    .catch((error) => {
                        console.error('Error comparing passwords:', error);
                        res.json({ success: false, message: 'An error occurred during login' });
                    });
            } else {
                res.json({ success: false, message: 'Invalid username or password' });
            }
        })
        .catch((error) => {
            console.error('Error finding user:', error);
            res.json({ success: false, message: 'An error occurred during login' });
        });
});

app.get('/signup', (req, res) => {
    const signupContent = fs.readFileSync(path.join(__dirname, 'views', 'signup.html'), 'utf8');

    const data = {
        pageTitle: 'Sign Up Page',
        bodyPageContent: signupContent,
    };
    res.render('template', { data, loggedIn: req.session.loggedIn });
});

app.post('/signup', (req, res) => {
    bcrypt.hash(req.body.password, 10)
        .then((hashedPassword) => {
            const newUser = new User({
                username: req.body.username,
                email: req.body.email,
                password: hashedPassword,
            });

            newUser.save()
                .then(() => {
                    res.json({ success: true });
                })
                .catch((error) => {
                    console.error('Error creating user:', error);
                    res.json({ success: false, message: 'An error occurred during signup' });
                });
        })
        .catch((error) => {
            console.error('Error hashing password:', error);
            res.json({ success: false, message: 'An error occurred during signup' });
        });
});

app.get('/contactUs', (req, res) => {
    const contactUsContent = fs.readFileSync(path.join(__dirname, 'views', 'contactUs.html'), 'utf8');

    const data = {
        pageTitle: 'Contact Us Page',
        bodyPageContent: contactUsContent,
        loggedIn: req.session.loggedIn,
        username: req.session.loggedIn ? req.session.loggedIn.username : '',
        email: req.session.loggedIn ? req.session.loggedIn.email : ''
    };
    res.render('template', { data, loggedIn: req.session.loggedIn });
});

app.post('/contactUs', (req, res) => {

    let name = req.body.username;
    let email = req.body.email;
    let subject = req.body.subject;
    let message = req.body.text;

    let mailOptions1 = {
        from: 'forProjectSummer23@gmail.com',
        to: 'forProjectSummer23@gmail.com',
        subject: 'Mail from ' + name + ' about ' + subject,
        text: message + ' return email ' + email
    };
    let mailOptions2 = {
        from: 'forProjectSummer23@gmail.com',
        to: email,
        subject: 'your message has been recived',
        text: 'your message has been recived, we will contact you soon'
    };

    transporter.sendMail(mailOptions1, function (error, info) {
        if (error) {
            console.log(error);
            res.json({ success: false, message: 'An error occurred while sending the email' });
        } else {
            console.log('Email sent: ' + info.response);
            transporter.sendMail(mailOptions2, function (error, info) {
                if (error) {
                    console.log(error);
                    res.json({ success: false, message: 'An error occurred while sending the email' });
                } else {
                    console.log('Email sent: ' + info.response);
                    res.json({ success: true, message: 'Emails sent successfully' });
                }
            });
        }
    });
});



//stocks

// Set the template engine to EJS
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views'); // Specify the directory where your templates are located

app.get('/stocks', (req, res) => {
    const stocksContent = fs.readFileSync(path.join(__dirname, 'views', 'stocks.html'), 'utf8');

    const data = {
        pageTitle: 'Stocks',
        bodyPageContent: stocksContent,
    };
    res.render('template', { data, loggedIn: req.session.loggedIn });
});


app.post('/stocks', (req, res) => {

    let itemFromsearch = req.body.stockSearchInput;
    var url1 = 'https://api.twelvedata.com/price?symbol=' + itemFromsearch + '&apikey=' + keyForStock;
    var url2 = 'https://api.twelvedata.com/quote?symbol=' + itemFromsearch + '&apikey=' + keyForStock;
    var url3 = 'https://api.twelvedata.com/market_movers/stocks?outputsize=20&apikey=' + keyForStock;
    var url4 = 'https://api.twelvedata.com/time_series?symbol=' + itemFromsearch + '&interval=1day&apikey=' + keyForStock;
    request.get({
        url: url1,
        json: true,
        headers: { 'User-Agent': 'request' }
    }, (err, response, data1) => {
        if (err) {
            console.log('Error:', err);
        } else if (response.statusCode !== 200) {
            console.log('Status:', response.statusCode);
        } else {
            // data1 is successfully parsed as a JSON object
            // Make the second request
            request.get({
                url: url2,
                json: true,
                headers: { 'User-Agent': 'request' }
            }, (err, response, data2) => {
                if (err) {
                    console.log('Error:', err);
                } else if (response.statusCode !== 200) {
                    console.log('Status:', response.statusCode);
                } else {
                    request.get({
                        url: url4,
                        json: true,
                        headers: { 'User-Agent': 'request' }
                    }, (err, response4, dataFromResponse4) => {
                        if (err) {
                            console.log('Error:', err);
                            res.render('error', { message: 'Error fetching data.' });
                        } else if (response4.statusCode !== 200) {
                            console.log('Status:', response4.statusCode);
                            res.render('error', { message: 'Error fetching data.' });
                        } else {
                            // dataFromResponse1 and dataFromResponse2 and dataFromResponse4 are successfully fetched
                            // Pass the data to the template for rendering
                            res.render('presentStock', {
                                itemFromsearch: itemFromsearch,
                                dataFromResponse1: data1,
                                dataFromResponse2: data2,
                                dataFromResponse4: dataFromResponse4
                            });
                        }
                    });
                    
                }
            });
        }
    });

    
    
});

// Logout route
app.get('/logout', (req, res) => {
    req.session.loggedIn = false;
    res.redirect('/');
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});