const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Meetings = require("./meetings")

const userSchema = new mongoose.Schema({
    email:{
        type: String,
        required: [true, 'El correo electronico no puede ser nulo.']
    },
    username:{
        type: String,
        required: [true, 'El nombre de usuario no puede ser nulo.']
    },
    number:{
        type: String,
        required: [true, 'El numero telefonico no puede ser nulo.']        
    },
    password:{
        type: String,
        required: [true, 'La contraseña no puede ser nulo.']
    },
    role:{
        type: Number,
        require: [true, 'El rol no puede ser nulo.']
    },
    meetings: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Meetings"
        }
    ]

})


userSchema.statics.findAndValidate = async function(email, password ){
    const foundUser = await this.findOne({email});
    if(foundUser){
        const isValid = await bcrypt.compare(password, foundUser.password);
        return isValid ? foundUser : false;
    }
    return false;

}
module.exports = mongoose.model('User', userSchema);