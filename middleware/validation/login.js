const Joi = require('@hapi/joi');
const { Validator, ValidatingData } = require("./validator.js");


const schema = Joi.object({
    login: Joi.string()
        .required()
        .min(3)
        .max(100),
    password: Joi.string()
        .required()
        .min(3)
        .max(100)
}).options({ abortEarly: false });

module.exports = new Validator(schema, ValidatingData.body);