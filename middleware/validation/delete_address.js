const Joi = require('@hapi/joi');
const { Validator, ValidatingData } = require("./validator.js");


const schema = Joi.object({
    address_id: Joi.number()
        .required()
}).options({ abortEarly: false });

module.exports = new Validator(schema, ValidatingData.params);