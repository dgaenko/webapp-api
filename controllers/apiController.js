const { createHmac } = require("node:crypto");
const config         = require("config");
const md5            = require("md5");
const { Op }         = require('sequelize');
const BaseController = require("./baseController.js");
const jwt            = require("../components/jwt.js");
const { models }     = require("../components/db.js");
const notifier       = require("../components/notifier.js");
const Utils          = require("../components/utils.js");

function HMAC_SHA256(key, secret) {
    return createHmac("sha256", key).update(secret);
}
function getCheckString(data) {
    const items = [];
    for (const [k, v] of data.entries())
        if (k !== "hash") items.push([k, v]);
    return items.sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => `${k}=${v}`)
        .join("\n");
}


class ApiController extends BaseController {

    name = "ApiController";

    async index(ctx) {
        self.d(".index", ctx.session);
        let response = self.defaultSuccessResponse();
        self.sendResponse(ctx, response);
    }

    async test(ctx) {
        self.d(".test", ctx.session);
        let response = self.defaultErrorResponse();

        try {
            const data = ctx.request.body;

            for (let i = 0; i < 100; i++) {
                const res = await models.Card.getRandom();
                console.log(i, res?.title);
            }

            response = self.defaultSuccessResponse();
        } catch (ex) {
            console.log("ERROR", ex);
            response.message = ex.errors[0].message;
        }

        self.sendResponse(ctx, response);
    }


    async validateInit(ctx) {
        self.d(".validateInit", ctx.request.body);
        let response = self.defaultErrorResponse(401);

        try {
            const data = new URLSearchParams(ctx.request.body);
            const data_check_string = getCheckString(data);
            const secret_key = HMAC_SHA256("WebAppData", config.get("tg.token")).digest();
            const hash = HMAC_SHA256(secret_key, data_check_string).digest("hex");
            if (hash === data.get("hash")) {
                response = self.defaultSuccessResponse();
                const user = JSON.parse(data.get("user"));
                await models.User.createIfNotExists(
                    user.id,
                    user.username,
                    user.first_name + " " + user.last_name,
                    data.get("hash"),
                    ctx.request.header['x-real-ip']
                );
                response.tokens = models.User.generateTokens(user.id, data.get("hash"));
            } else {
                response.message = "Validation failed";
            }
        } catch (ex) {
            console.log(ex);
            response.message = ex.message;
        }
        console.log(response);
        self.sendResponse(ctx, response);
    }


    async getCode(ctx) {
        self.d(".getCode", ctx.params);

        let response = self.defaultErrorResponse();

        const user = await models.User.findOne({
            where: {
                [Op.and]: [
                    { hash: ctx.params.hash },
                    { active: 1 }
                ]
            }
        });
        console.log("user", user);
        if (user) {
            console.log("session", ctx.session);
            ctx.session.hash = ctx.params.hash;
            ctx.session.code = Utils.getRandomNumberString(4);
            console.log("session", ctx.session);
            notifier.emit('send_code', user.tg_chat_id, ctx.session.code);
            response = self.defaultSuccessResponse();
        } else {
            response.message = "Пользователь не найден";
        }

        self.sendResponse(ctx, response);
    }

    async checkCode(ctx) {
        self.d(".checkCode");
        let response = self.defaultErrorResponse();

        const data = ctx.params;
        console.log(data, ctx.session);
        if (ctx.session.hash && ctx.session.code === data.code) {
            const user = await models.User.findOne({
                where: {
                    [Op.and]: [
                        { hash: ctx.session.hash },
                        { active: 1 }
                    ]
                }
            });
            if (user) {
                response = self.defaultSuccessResponse();
                response.tokens = models.User.generateTokens(user.user_id, user.hash);
            } else {
                response.message = "Пользователь не найден";
            }
        } else {
            response.message = "Не верный код авторизации";
        }

        self.sendResponse(ctx, response);
    }

    async refresh(ctx) {
        self.d(".refresh", ctx.request.body);
        let response = self.defaultErrorResponse();
        try {
            const payload = await jwt.getJWTPayload(ctx.request.body.refresh_token);
            console.log("PAYLOAD", payload);
            response = self.defaultSuccessResponse();
            response.tokens = models.User.generateTokens(payload.user_id, payload.hash);
        } catch (ex) {
            console.log(ex)
            response.message = ex.message;
        }
        self.sendResponse(ctx, response);
    }

    async login(ctx) {
        self.d(".login", ctx.request.body);
        let response = self.defaultErrorResponse();
        try {
            const user = await models.User.findOne({
                where: {
                    [Op.or]: [
                        { email: ctx.request.body.login },
                        { phone: ctx.request.body.login }
                    ],
                    [Op.and]: [
                        { active: 1 }
                    ]
                }
            });
            console.log("user", user);
            if (user && await models.User.checkPassword(ctx.request.body.password, user.password) ) {
                response = self.defaultSuccessResponse();
                response.tokens = models.User.generateTokens(user.user_id, user.hash);
            } else {
                response.message = "Неверный логин или пароль";
            }
        } catch (ex) {
            console.log(ex)
            response.message = ex.message;
        }
        self.sendResponse(ctx, response);
    }

    async register(ctx) {
        self.d(".register", ctx.request.body);
        let response = self.defaultErrorResponse();
        try {
            const user = await models.User.findOne({
                where: {
                    [Op.or]: [
                        { email: ctx.request.body.email },
                        { phone: ctx.request.body.phone }
                    ],
                }
            });
            console.log("user", user);
            if (user) {
                response.message = "Пользователь уже зарегистрирован.";
            } else {
                const data = ctx.request.body;
                const user = await models.User.create({
                    user_name: data.user_name,
                    full_name: data.full_name,
                    phone: data.phone,
                    email: data.email,
                    password: data.password,
                    hash: md5(new Date()),
                    ip: ctx.request.header['x-real-ip'] ? ctx.request.header['x-real-ip'] : ctx.request.ip,
                    last_login_dt: new Date()
                });
                response = self.defaultSuccessResponse();
                response.tokens = models.User.generateTokens(user.user_id, user.hash);
            }
        } catch (ex) {
            console.log(ex)
            response.message = ex.message;
        }
        self.sendResponse(ctx, response);
    }

    async user(ctx) {
        self.d(".user", ctx.session.user);

        let response = self.defaultErrorResponse();

        try {
            const user = await models.User.findOne({
                where: {
                    [Op.and]: [
                        { hash: ctx.session.user.hash },
                        { active: 1 }
                    ]
                },
            });
            if (user) {
                response = self.defaultSuccessResponse();
                response.user = user;
                response.cards = await models.UserCard.findAll({
                    where: {
                        user_id: user.user_id
                    },
                    include: {
                        model: models.Card,
                        where: { active: 1 }
                    }
                });
            } else {
                response.message = "Пользователь не найден";
            }
        } catch (ex) {
            console.log(ex)
            response.message = ex.message;
        }

        self.sendResponse(ctx, response);
    }

    async setUser(ctx) {
        self.d(".setUser", ctx.request.body);

        let response = self.defaultErrorResponse();

        try {
            const user = await models.User.findOne({
                where: {
                    [Op.and]: [
                        { hash: ctx.session.user.hash },
                        { active: 1 }
                    ]
                },
            });
            if (user) {
                const data = ctx.request.body;
                user.phone = data.phone ?? null;
                user.email = data.email ?? null;
                user.address_id = data.address_id ?? null;
                user.save();
                response = self.defaultSuccessResponse();
            } else {
                response.message = "Пользователь не найден";
            }
        } catch (ex) {
            console.log("ERROR", ex);
            response.message = ex.errors[0].message;
        }

        self.sendResponse(ctx, response);
    }

    async getAddresses(ctx) {
        self.d(".getAddresses");

        let response = self.defaultErrorResponse();

        try {
            const addresses = await models.Address.findAll({
                where: {
                    user_id: ctx.session.user.user_id
                },
            });
            response = self.defaultSuccessResponse();
            response.addresses = addresses;
        } catch (ex) {
            console.log("ERROR", ex);
            response.message = ex.errors[0].message;
        }

        self.sendResponse(ctx, response);
    }

    async addAddress(ctx) {
        self.d(".addAddress");

        let response = self.defaultErrorResponse();

        try {
            const data = ctx.request.body;
            const address = await models.Address.create({
                user_id: ctx.session.user.user_id,
                address: data.address,
                city: data.city,
                region: data.region,
                country: data.country,
                zip: data.zip
            });
            response = self.defaultSuccessResponse();
        } catch (ex) {
            console.log("ERROR", ex);
            response.message = ex.errors[0].message;
        }

        self.sendResponse(ctx, response);
    }

    async setAddress(ctx) {
        self.d(".setAddress", ctx.request.body);

        let response = self.defaultErrorResponse();

        try {
            const data = ctx.request.body;
            await models.Address.update({
                address: data.address,
                city: data.city,
                region: data.region,
                country: data.country,
                zip: data.zip
            }, {
                where: {
                    [Op.and]: [
                        { user_id: ctx.session.user.user_id },
                        { address_id: data.address_id },
                        { active: 1 }
                    ]
                }
            });
            response = self.defaultSuccessResponse();
        } catch (ex) {
            console.log("ERROR", ex);
            response.message = ex.errors[0].message;
        }

        self.sendResponse(ctx, response);
    }

    async deleteAddress(ctx) {
        self.d(".deleteAddress");

        let response = self.defaultErrorResponse();

        try {
            await models.Address.update(
                {
                    active: 0
                }, {
                    where: {
                        [Op.and]: [
                            { user_id: ctx.session.user.user_id },
                            { address_id: ctx.params.address_id }
                        ]
                    }
                }
            );
            response = self.defaultSuccessResponse();
        } catch (ex) {
            console.log("ERROR", ex);
            response.message = ex.errors[0].message;
        }

        self.sendResponse(ctx, response);
    }

    async getCard(ctx) {
        self.d(".getCard");
        let response = self.defaultErrorResponse();

        try {
            let card = await models.Card.getRandom();
            await models.UserCard.addCard(ctx.session.user.user_id, card.card_id);
            response = self.defaultSuccessResponse();
        } catch (ex) {
            console.log("ERROR", ex);
            response.message = ex.errors[0].message;
        }

        self.sendResponse(ctx, response);
    }

    async getCards(ctx) {
        self.d(".getCards", ctx.session.user);

        let response = self.defaultErrorResponse();

        const user = await models.User.findOne({
            where: {
                [Op.and]: [
                    { hash: ctx.session.user.hash },
                    { active: 1 }
                ]
            },
        });
        if (user) {
            response = self.defaultSuccessResponse();
            response.cards = await models.UserCard.findAll({
                where: {
                    user_id: user.user_id
                },
                include: {
                    model: models.Card,
                    where: { active: 1 }
                }
            });
        }

        self.sendResponse(ctx, response);
    }

    async createOrder(ctx) {
        self.d(".createOrder", ctx.request.body);
        let response = self.defaultErrorResponse();

        try {
            const products = ctx.request.body.products.replace(/[^\d,]/g, "").split(",");
            const counts = ctx.request.body.counts.replace(/[^\d,]/g, "").split(",");
            console.log(products)
            if (products.length) {
                const order = await models.Order.create({
                    user_id: ctx.session.user.user_id
                });
                let i = 0;
                for (const product_id of products) {
                    const product = await models.Product.findOne({
                        where: {
                            [Op.and]: [
                                {product_id: product_id},
                                {active: 1}
                            ]
                        }
                    });
                    if (product && product.quantity - product.reserved >= counts[i]) {
                        const res = await models.OrderProduct.create({
                            order_id: order.order_id,
                            product_id: product_id,
                            price: product.price,
                            quantity: counts[i]
                        });
                        console.log(res);
                        product.reserved += parseInt(counts[i]);
                        product.save();
                    }
                    i++;
                }
                response = self.defaultSuccessResponse();
            } else {
                response.message = "Нет продуктов в заказе";
            }
        } catch (ex) {
            console.log("ERROR", ex);
            response.message = ex.errors[0].message;
        }

        self.sendResponse(ctx, response);
    }

    async getOrders(ctx) {
        self.d(".getOrders");

        let response = self.defaultErrorResponse();

        try {
            const orders = await models.Order.findAll({
                where: {
                    user_id: ctx.session.user.user_id
                },
                include: {
                    model: models.OrderProduct
                }
            });
            response = self.defaultSuccessResponse();
            response.orders = orders;
        } catch (ex) {
            console.log("ERROR", ex);
            response.message = ex.errors[0].message;
        }

        self.sendResponse(ctx, response);
    }

    async getProducts(ctx) {
        self.d(".getProducts");

        let response = self.defaultErrorResponse();

        try {
            const products = await models.Product.findAll({
                where: {
                    active: 1
                }
            });
            response = self.defaultSuccessResponse();
            response.products = products;
        } catch (ex) {
            console.log("ERROR", ex);
            response.message = ex.errors[0].message;
        }

        self.sendResponse(ctx, response);
    }

}

const self = new ApiController();
module.exports = self;