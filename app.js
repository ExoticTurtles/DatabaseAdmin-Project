const express = require('express');
const ExpressError = require("./utils/ExpressError");
const methodOverride = require('method-override')
const path = require('path');
const mongoose = require('mongoose');
//const Campground = require('./models/interfaces');
const ejsMate = require('ejs-mate');
const catchAsync = require("./utils/catchAsync");
const { emitWarning } = require('process');
const User = require('./models/user')
const Pets = require('./models/pets')
const bcrypt = require('bcrypt');
const { Hash } = require('crypto');
const session = require('express-session')


mongoose.connect('mongodb://localhost:27017/TXkennels', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind('connection error error:'));
db.once("open", () =>{
    console.log("Database connected");
});

const app = express();
app.use(express.static(__dirname + '/views'));
app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.use(session({secret: 'notasecret'}))
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));

app.use((req, res, next) =>{
    res.locals.currentUser = req.session.user_id;
    res.locals.Username = req.session.username;
    console.log(req.currentUser)
    next();
})

const requireLogin = (req, res, next) => {
    if (!req.session.user_id){
        return res.redirect('/login')
    }
    next();

}

app.get('/', (req, res) => {
    res.render('../interfaces/index');
})


app.get('/register',  async (req, res) => {
    res.render('../interfaces/register');
})

app.post('/register', async (req,res) => {
    const {email, username, number, password} = req.body;
    const hash = await bcrypt.hash(password, 12)
    const user = new User({
        email,
        username, 
        number,
        password: hash
    })
    await user.save();
    req.session.user_id = user._id;
    res.redirect('/')

})


app.get('/login',  async (req, res) => {
    res.render('../interfaces/login');
})

app.post('/login', async (req,res) => {
    const {email, password} = req.body;
    const foundUser = await User.findAndValidate(email, password);
    if(foundUser){
        req.session.user_id = foundUser._id;
        req.session.username = foundUser.username;
        req.session.email = foundUser.email;

        res.redirect('/');
    }
    else{
        res.redirect('/login');
    }
})

app.get('/pets',  async (req, res) => {
    res.render('../interfaces/pets');
})

app.get('/pets/new',  async (req, res) => {
    res.render('../interfaces/newPets');
})

app.post('/pets/new', async (req,res) => {
    const {name, raza, image, price, description} = req.body;
    const pets = new Pets({
        name,
        raza,
        image, 
        price,
        description
    })
    await pets.save();
    res.redirect('/pets')

})


app.get('/products',  async (req, res) => {
    res.render('../interfaces/products');
})

app.get('/logout', (req, res) =>{
    req.session.user_id = null;
    res.redirect('/')
})

app.post('/logout', (req, res) =>{
    req.session.user_id = null;
    res.redirect('/')
})

app.get('/secret', requireLogin, (req, res) => {
    res.send("Secretooooo")
})


app.all('*', (req,res,next) =>{
    next(new ExpressError("Page Not Found", 404))
})

app.use((err, req, res, next) => {
    const {statusCode = 500} = err;
    if(!err.message) err.message = "oh boy something went wrong"
    res.status(statusCode).render("error", {err});
})

app.listen(3000, ()=>{
console.log('Serving on port 3000');
});