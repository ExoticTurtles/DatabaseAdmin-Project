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
const Products = require('./models/products')

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


app.use(catchAsync(async (req, res, next) =>{
    res.locals.currentUser = req.session.user_id;
    if(res.locals.currentUser){
        res.locals.currUser = await User.findById(res.locals.currentUser);
    }
    next();
}));

const validateProduct = ( req, res, next) =>{
    const {error}  = productSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg , 400)
    } else{
        next();
    }

}


const loggedIn = (req, res, next) => {
    if (req.session.user_id){
        return res.redirect('/')
    }
    next();

}

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

app.post('/register', loggedIn, async (req,res) => {
    const {email, username, number, password} = req.body;
    const hash = await bcrypt.hash(password, 12)
    const user = new User({
        email,
        username, 
        number,
        password: hash,
        role: 1
    })
    await user.save();
    req.session.user_id = user._id;
    res.redirect('/')

})


app.get('/login', loggedIn,  async (req, res) => {
    res.render('../interfaces/login');
})

app.post('/login', loggedIn, async (req,res) => {
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

app.get('/pets', requireLogin,  async (req, res) => {
    const pets = await Pets.find({});
    res.render('../interfaces/showPets', {pets});

})

app.get('/pets/new', requireLogin,  async (req, res) => {
    res.render('../interfaces/newPets');
})

app.post('/pets/new', requireLogin, async (req,res) => {
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

app.put('/pets/:id', requireLogin, catchAsync( async (req, res) => {
    const {id} = req.params;
    const pet = await Pets.findByIdAndUpdate(id, {...req.body.pet})
    res.redirect('/pets')
}));

app.get('/pets/:id/edit', requireLogin,  catchAsync( async (req, res) => {
    const pet = await Pets.findById(req.params.id);
    res.render('../interfaces/editPets', {pet});
}));

app.delete('/pets/:id/delete',  requireLogin, catchAsync( async (req, res) => {
    const {id} = req.params;
    await Pets.findByIdAndDelete(id);
    res.redirect('/pets');
}));


app.get('/products',  async (req, res) => {
    const products = await Products.find({});
    res.render('../interfaces/showProducts', {products});
})

app.get('/products/new', requireLogin,  async (req, res) => {
    res.render('../interfaces/newProducts');
})

app.post('/products/new', requireLogin, async (req,res) => {
    const {name, quantity, image ,price, description} = req.body;
    const products = new Products({
        name,
        quantity,
        image,
        price,
        description
    })
    await products.save();
    res.redirect('/products')

})


app.put('/products/:id', requireLogin, catchAsync( async (req, res) => {
    const {id} = req.params;
    const product = await Products.findByIdAndUpdate(id, {...req.body.product})
    res.redirect('/products')
}));

app.get('/products/:id/edit', requireLogin,  catchAsync( async (req, res) => {
    const product = await Products.findById(req.params.id);
    res.render('../interfaces/editProducts', {product});
}));

app.delete('/products/:id/delete', requireLogin,  catchAsync( async (req, res) => {
    const {id} = req.params;
    await Products.findByIdAndDelete(id);
    res.redirect('/products');
}));

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