const Joi = require('@hapi/joi');
const { Validator, ValidatingData } = require("./validator.js");


const schema = Joi.object({
    address_id: Joi.number()
        .allow(null),
    phone: Joi.string()
        .allow(null)
        .min(11)
        .max(11),
    email: Joi.string()
        .allow(null)
        .min(6)
        .max(100)
}).options({ abortEarly: false });

module.exports = new Validator(schema, ValidatingData.body);