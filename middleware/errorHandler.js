const Log = require("../components/log.js");

class ErrorHandler extends Log {

    name  = "ErrorHandler";

    async handle(ctx, next) {
        try {
            await next();
        } catch (err) {
            self.e(".handle", err);
            ctx.status = err.statusCode || err.status || 500;
            ctx.body = {
                message: err.message
            };
        }
    }

}

const self = new ErrorHandler();
module.exports = self.handle;