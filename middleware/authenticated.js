/**
 * Проверка авторизованности пользователя
 */

const jwt = require("../components/jwt.js");
const Log = require("../components/log.js");
const { models } = require("../components/db.js");

const log = new Log('authenticated');

module.exports = async (ctx, next) => {
    let token = ctx.request.headers['x-auth-token'];

    // region берем токен из кук или из параметров запроса
    if (!token && ctx.cookies.get('token')) {
        token = ctx.cookies.get('token');
    }
    if (!token && ctx.request.query['token']) {
        token = ctx.request.query['token'];
    }
    // endregion
    log.d(" token:", token);

    // region Проверка наличия JWT-токена
    if (!token) {
        ctx.status = 403;
        ctx.body = {
            status: 'ERROR',
            message: 'Отсутствует токен'
        };
        return;
    }
    // endregion

    // region Проверка JWT-токена
    try {
        const payload = await jwt.getJWTPayload(token);
        log.d(" payload", payload);
        // ищем по hash из payload юзера (для блокировки юзеров, т.к. jwt-токены не позволяют это делать)
        const user = await models.User.findOne({
            where: {
                hash: payload.hash
            }
        });
        //console.log(user);
        if (user) {
            ctx.session.user = user;
            await next();
        } else {
            ctx.status = 403;
            ctx.body = {
                status: 'ERROR',
                message: 'Доступ запрещен'
            };
        }
    } catch (ex) {
        console.log(ex);
        ctx.status = 401;
        ctx.body = {
            status: 'ERROR',
            message: 'Требуется авторизация'
        };
    }
    // endregion
};