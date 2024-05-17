const Joi = require('@hapi/joi');
const { Validator, ValidatingData } = require("./validator.js");


const schema = Joi.object({
    address_id: Joi.number(),
    products: Joi.string()
        .required()
        .min(1)
        .max(500),
    counts: Joi.string()
        .required()
        .min(1)
        .max(500)
}).options({ abortEarly: false });

module.exports = new Validator(schema, ValidatingData.body);