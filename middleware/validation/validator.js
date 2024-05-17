const Log = require("../../components/log.js");

/**
 * Тип проверяемых данных
 */
const ValidatingData = {
    body: 1,
    params: 2,
    query: 3
}

class Validator extends Log {

    name = "Validator";
    validatingData;
    schema;

    /**
     * Конструктор валидатора
     * @param schema                Схема для проверки
     * @param validatingData        Тип проверяемых данных (см. ValidatingData)
     */
    constructor(schema, validatingData = ValidatingData.body) {
        super();
        this.schema = schema;
        this.validatingData = validatingData;
    }

    validator = async (ctx, next) => {
        this.d(".handle");
        console.log(ctx.request.body)
        let data = {};
        try {
            switch (this.validatingData) {
                case ValidatingData.body:
                    data = ctx.request.body;
                    break;
                case ValidatingData.params:
                    data = ctx.params;
                    break;
                case ValidatingData.query:
                    data = ctx.request.query;
                    break;
            }
            let { error } = this.schema.validate(data);
            if (error) {
                this.e(".handle", error.message);
                ctx.status = 400;
                ctx.body = {
                    "status": "ERROR",
                    "message": error.message
                };
            } else {
                await next();
            }
        } catch (ex) {
            this.e(".handle ERROR", ex);
        }
    }

}

module.exports = {
    Validator,
    ValidatingData
};