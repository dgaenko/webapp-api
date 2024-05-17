const config          = require("config");
const { sign }        = require("jsonwebtoken");
const libphonenumbers = require('libphonenumbers');

class User_utils {

    phoneNormalize(phone) {
        return phone.replace(/[^\d]*/g, "");
    }

    createToken(payload) {
        return sign(payload, config.get("jwt.secret"), { expiresIn: config.get("jwt.expire") });
    }

    validatePhone(phone) {
        if (!phone) {
            return false;
        }
        try {
            const PNF = libphonenumbers.PhoneNumberFormat;
            const phoneUtil = libphonenumbers.PhoneNumberUtil.getInstance();
            const number = phoneUtil.parseAndKeepRawInput(phone, 'RU');
            return phoneUtil.isValidNumber(number)
                ? phoneUtil.format(number, PNF.INTERNATIONAL)
                : false;
        } catch (ex) {
            console.log(ex);
            return false;
        }
    }

    formatPhone(phone) {
        try {
            const phoneUtil = libphonenumbers.PhoneNumberUtil.getInstance();
            if (!/^\+/.test(phone)) {
                phone = '+' + phone;
            }
            const number = phoneUtil.parseAndKeepRawInput(phone);
            const PNF = libphonenumbers.PhoneNumberFormat;
            phone = phoneUtil.format(number, PNF.INTERNATIONAL);
        } catch (ex) {
            console.log(ex);
        }
        return phone;
    }

}

module.exports = new User_utils();