const Joi = require('@hapi/joi');
const { Validator, ValidatingData } = require("./validator.js");


const schema = Joi.object({
    user_name: Joi.string()
        .allow(null)
        .max(100),
    full_name: Joi.string()
        .allow(null)
        .max(255),
    phone: Joi.string()
        .allow(null)
        .min(11)
        .max(11),
    email: Joi.string()
        .required()
        .email()
        .min(6)
        .max(100),
    password: Joi.string()
        .required()
        .min(4)
        .max(100),
}).options({ abortEarly: false });

module.exports = new Validator(schema, ValidatingData.body);