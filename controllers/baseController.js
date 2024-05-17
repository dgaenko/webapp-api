const Log        = require("../components/log.js");
const notifier   = require("../components/notifier.js");

/**
 * Базовый класс контроллера
 */
class BaseController extends Log {

    constructor() {
        super();
        notifier.on('onServerStarted', this.onServerStarted.bind(this));
    }

    async onServerStarted(app) {
        this.d(".onServerStarted", app);
    }

    defaultSuccessResponse() {
        return {
            "status": "OK"
        }
    }
    defaultErrorResponse(code = 400) {
        return {
            "status": "ERROR",
            "message": ""
        }
    }

    /**
     * Отправка ответа клиенту
     * @param ctx                   Контекст запроса
     * @param {object} response     Объект с данными ответа
     * @param {int|null} code       HTTP-код ответа
     */
    sendResponse(ctx, response, code = null) {
        if (!code) {
            ctx.status = response.status === "OK" ? 200 : 400;
            if (response.code) {
                ctx.status = response.code;
                delete(response.code);
            }
        } else {
            ctx.status = code;
        }
        ctx.body = response;
    }

}

module.exports = BaseController;