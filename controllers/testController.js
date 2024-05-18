const config         = require("config");

const BaseController = require("./baseController.js");
const { models }     = require("../components/db.js");


class TestController extends BaseController {

    name = "TestController";

    async test(ctx) {
        self.d(".test", ctx.session);
        let response = self.defaultErrorResponse();

        try {
            response = self.defaultSuccessResponse();
            response.data = {
                password: models.User.createPasswordHash('12345'),
            }
        } catch (ex) {
            console.log("ERROR", ex);
            response.message = ex.errors[0].message;
        }

        self.sendResponse(ctx, response);
    }


    async test1(ctx) {
        self.d(".test1");
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

}

const self = new TestController();
module.exports = self;