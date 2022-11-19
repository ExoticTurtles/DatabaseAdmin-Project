const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const petsSchema = new mongoose.Schema({
    name:{
        type: String,
        required: [true, 'El nombre de la mascota no puede ser nulo.']
    },
    raza:{
        type: String,
        required: [true, 'El nombre de la raza no puede ser nulo.']
    },
    image:{
        type: String,
        required: [true, 'La imagen debe existir.']
    },
    price: Number,
    description: String
})

module.exports = mongoose.model('Pets', petsSchema);
