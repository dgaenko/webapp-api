const Joi = require('@hapi/joi');
const { Validator, ValidatingData } = require("./validator.js");


const schema = Joi.object({
    code: Joi.string()
        .required()
        .min(4)
        .max(4)
}).options({ abortEarly: false });

module.exports = new Validator(schema, ValidatingData.body);