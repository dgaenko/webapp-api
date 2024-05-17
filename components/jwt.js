const config = require("config");
const jwt    = require('jsonwebtoken');
const koaJwt = require("koa-jwt");
const util   = require("util");

const secret = config.get("jwt.secret");

module.exports = {

    jwtAuth: koaJwt({ secret: secret }),

    getToken: (payload = {}, lifeTime) => {
        return jwt.sign(payload, secret, { expiresIn: lifeTime });
    },

    getJWTPayload: async (token) => {
        const verify = util.promisify(jwt.verify);
        return verify(token, secret);
    }
}
