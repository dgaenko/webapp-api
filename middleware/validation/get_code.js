const Joi      = require('@hapi/joi');
const { Validator, ValidatingData } = require("./validator.js");


const schema = Joi.object({
    hash: Joi.string()
        .required()
        .min(5)
        .max(128)
}).options({ abortEarly: false });

module.exports = new Validator(schema, ValidatingData.params);