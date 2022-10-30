const express = require('express');
const ExpressError = require("./utils/ExpressError");
const methodOverride = require('method-override')
const path = require('path');
const mongoose = require('mongoose');
//const Campground = require('./models/interfaces');
const ejsMate = require('ejs-mate');
const catchAsync = require("./utils/catchAsync");


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
app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))


app.get('/', (req, res) => {
    res.render('home');
})

app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));

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