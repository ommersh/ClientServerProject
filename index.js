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
const request = require('request');
const MongoDBStore = require('connect-mongodb-session')(session);
const MONGODB_URI = 'mongodb+srv://vercel-admin-user:SpToSHOYyg6s9dgz@myfirstcluster.wnavi.mongodb.net/mydatabase?retryWrites=true&w=majority';
process.env.MONGODB_URI = MONGODB_URI;
const twelvedata = require("twelvedata");

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

const User = mongoose.model('User', userSchema);

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

app.post('/login', async  (req, res) => {
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

app.post('/signup', async  (req, res) => {
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
    };
    res.render('template', { data, loggedIn: req.session.loggedIn });
});

app.post('/contactUs', async  (req, res) => {

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
        text: 'your message has been recived, we will contect you soon'
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
app.get('/stocks', (req, res) => {
    const stocksContent = fs.readFileSync(path.join(__dirname, 'views', 'stocks.html'), 'utf8');

    const data = {
        pageTitle: 'Stocks',
        bodyPageContent: stocksContent,
    };
    res.render('template', { data, loggedIn: req.session.loggedIn });
});


app.post('/stocks', async  (req, res) => {
    const { stockSearchInput, timeIntervalSelect } = req.body;
    const url = `https://api.twelvedata.com/time_series?symbol=${stockSearchInput}&interval=${timeIntervalSelect}&apikey=${keyForStock}`;

    // Make API request to fetch stock data based on stock symbol and time interval
    fetch(url)
        .then(response => response.json())
        .then(data => {
            // Process the stock data as needed and send it back to the client
            res.json(data);
        })
        .catch(error => {
            console.error('Error:', error);
            res.status(500).json({ error: 'An error occurred' });
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