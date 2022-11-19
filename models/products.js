const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const productsSchema = new mongoose.Schema({
    name:{
        type: String,
        required: [true, 'El nombre del producto no puede ser nulo.']
    },
    quantity: Number,
    image:{
        type: String,
        required: [true, 'La imagen debe existir.']
    },
    price: Number,
    description: String
})

module.exports = mongoose.model('Products', productsSchema);
