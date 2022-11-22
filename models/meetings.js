const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Pets = require("./pets")
const User = require("./user")

const meetingsSchema = new mongoose.Schema({
    date:{
        type: Date,
        required: [true, 'La fecha no es valida']
    },
    description:{
        type: String,
        required: [true, 'La descripción debe existir']
    },
    status:{
        type: String,
        required: [true, 'El estatus debe de existir']
    },
    petID:
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Pets"
        },
    userID:
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        }
})

module.exports = mongoose.model('Meetings', meetingsSchema);