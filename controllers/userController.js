const config         = require("config");

const BaseController = require("./baseController.js");
const Utils          = require("../components/utils.js");
const jwt            = require("../components/jwt.js");
const { models }     = require("../components/db.js");


class UserController extends BaseController {

    name = "UserController";

    generateTokens(user) {
        const payload = { user_id: user.user_id };
        return {
            access: jwt.getToken(payload, config.get("jwt.ttl_access_token")),
            refresh: jwt.getToken(payload, config.get("jwt.ttl_refresh_token"))
        }
    }

    async register(ctx) {
        let response = self.defaultErrorResponse();

        try {
            const data = ctx.request.body;

            const ip = ctx.request.header['x-real-ip'];

            const user = await models.User.create({
                first_name: data.first_name,
                middle_name: data.middle_name,
                last_name: data.last_name,
                email: data.email,
                phone: data.phone,
                ip: ctx.request.ip,
                last_login_dt: new Date()
            });
            response = self.defaultSuccessResponse();
            response.tokens = self.generateTokens(user);
        } catch (ex) {
            console.log("ERROR", ex);
            // Локализация сообщений об ошибках
            response.message = ex.errors[0].message;
            ex.errors.forEach((error) => {
                const fields = {
                    'users_phone': 'Телефон',
                    'users_email': 'E-mail'
                }
                switch (error.validatorKey) {
                    case 'not_unique':
                        response.message = `${fields[error.path]} ${error.value} уже используется`;
                        response.code = 409;
                        break;
                }
            });
        }

        self.sendResponse(ctx, response);
    }

    async code(ctx) {
        let response = self.defaultErrorResponse();

        try {
            const data = ctx.request.body;
            const user = await models.User.findOne({
                where: {
                    email: data.email,
                    active: 1
                }
            });
            if (user) {
                response = self.defaultSuccessResponse();
                const code = Utils.getRandomNumberString(config.get("settings.code_max_length"));
                ctx.session.user = user;
                ctx.session.code = code;
                console.log("CODE: ", code);
            } else {
                response.message = "Доступ запрещен";
                response.code = 403;
            }
        } catch (ex) {
            console.log("ERROR", ex);
        }

        self.sendResponse(ctx, response);
    }

    async login(ctx) {
        let response = self.defaultErrorResponse();

        try {
            const data = ctx.request.body;
            if (ctx.session.user && ctx.session.code === data.code) {
                delete(ctx.session.code);
                response = self.defaultSuccessResponse();
                response.tokens = self.generateTokens(ctx.session.user);
            } else {
                response.message = "Доступ запрещен";
                response.code = 403;
            }
        } catch (ex) {
            console.log("ERROR", ex);
        }

        self.sendResponse(ctx, response);
    }

}

const self = new UserController();
module.exports = self;