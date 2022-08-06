const mongoose = require('mongoose')
const Joi = require("joi");

const userschema = new mongoose.Schema({
    firstName: 'string',
    lastName: 'string',
    gender: 'string',
    ph_no: 'number',
    image: {
        type: 'string',
        default: null
    },
    email: 'string',
    password: 'string',
    verified: {
        type: Boolean,
        default: false
    },
    date: {
        type: Date,
        default: Date.now
    }
});

const User = mongoose.model('user', userschema);

const validate = (user) => {
    const schema = Joi.object({

        firstName: Joi.string().min(3).max(255).required(),
        lastName: Joi.string().min(3).max(255).required(),
        gender: Joi.string().min(3).max(255).required(),
        ph_no: Joi.string().length(10).pattern(/^[0-9]+$/).required(),
        email: Joi.string().email().required(),
        password: Joi.string()
            .pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),
    });
    return schema.validate(user);
};

module.exports = {
    User,
    validate
};