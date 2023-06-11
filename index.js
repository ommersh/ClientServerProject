const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const session = require('express-session');

// Set up session middleware
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false
}));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(__dirname + '/css'));
app.use(express.static(__dirname + '/js'));
app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/views'));

app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect('mongodb://localhost/my_database', {
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

app.post('/login', async (req, res) => {
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

app.post('/signup', async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        const newUser = new User({
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword,          
        });

        await newUser.save();
        res.json({ success: true });
    } catch (error) {
        console.error('Error creating user:', error);
        res.json({ success: false, message: 'An error occurred during signup' });
    }
});

// Logout route
app.get('/logout', (req, res) => {
    req.session.loggedIn = false;
    res.redirect('/');
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});