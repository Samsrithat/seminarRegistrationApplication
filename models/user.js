const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');

const userSchema = new Schema({
    firstName: {type: String, required: [true, 'firstName is required']},
    lastName: {type: String, required: [true, 'Last name is required']},
    email: {type: String, required: [true, 'email address is required'], 
            unique: [true, 'This email address has already been used']},
    password: {type: String, required: [true, 'password is required']},
});

userSchema.pre('save', function(next){
    let user = this;
    if(!user.isModified('password'))
        return next();
        bcrypt.hash(user.password, 10)
        .then(hash => {
            user.password = hash;
            next();
        })
        .catch(err => next(error));
});

userSchema.methods.comparePassword = function(inputPassword){
    let user = this;
    return bcrypt.compare(inputPassword, user.password);
}

module.exports = mongoose.model('User', userSchema);