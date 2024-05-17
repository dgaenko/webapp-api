const Joi = require('@hapi/joi');
const { Validator, ValidatingData } = require("./validator.js");


const schema = Joi.object({
    phone: Joi.string()
        .required()
        .min(11)
        .max(11),
    address: Joi.string()
        .required()
        .min(5)
        .max(512),
    city: Joi.string()
        .required()
        .min(2)
        .max(255),
    region: Joi.string()
        .required()
        .min(5)
        .max(255),
    country: Joi.string()
        .required()
        .min(2)
        .max(255),
    zip: Joi.string()
        .required()
        .min(5)
        .max(10),
}).options({ abortEarly: false });

module.exports = new Validator(schema, ValidatingData.body);