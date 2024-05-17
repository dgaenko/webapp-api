// region requires
const fs            = require("fs");
const path          = require("path");
const config        = require("config");
const cfonts        = require("cfonts");
const http          = require("http");
const cors          = require("@koa/cors");
const cacheControl  = require("koa-cache-control");
const session       = require("koa-session");
const serve         = require("koa-static");
const koaTwig       = require("koa-twig");
const morgan        = require("koa-morgan");
const Logger        = require("koa-logger");
const compress      = require("koa-compress");

const yamljs         = require('yamljs');
const { koaSwagger } = require('koa2-swagger-ui');

const routers       = require("../routers/index.js");
const errorHandler  = require("../middleware/errorHandler.js");
const notifier      = require("../components/notifier.js");
const Log           = require("../components/log.js");
const { db }        = require("../components/db.js");
const bot           = require("../components/bot/bot.js");
// endregion

require('dotenv').config();
const pjson = require('../package.json');

class Init extends Log {

    name = "Init";

    views_path = "views";
    host = null;
    app = null;

    constructor(app) {
        super();
        this.app = app;
        this.app.db = db;

        this.showSplash();

        //app.use(helmet());
        app.use(cacheControl({ maxAge: 5 }));
        app.use(cors());
        app.use(errorHandler);

        const options = { threshold: 1024 };
        app.use(compress(options));

        (async () => {
            await this.initDb();
            this.initStateHost();
            this.initContextState();
            this.initLogs();
            this.initTemplateSystem();
            this.initSession();
            this.initSwagger();
            routers.init(app);
        })();
    }

    showSplash() {
        cfonts.say(pjson.name,
        {
            font: 'block',
            align: 'left',
            colors: ["system"],
            background: 'transparent',
            letterSpacing: 1,
            lineHeight: 1,
            space: true,
            maxLength: '0',
            gradient: false,
            independentGradient: false,
            transitionGradient: false,
            env: 'node'
        });
        const splash = [
            '-'.repeat(80),
            ' Version: ' + this.yellow(pjson.version) + '    Mode: ' + this.yellow(process.env.NODE_ENV),
            '-'.repeat(80)
        ];
        splash.forEach(line => console.log(line));
    }

    async initDb() {
        this.d(".initDb");
        await db.openConnection();
        await db.runMigrations();
        //await db.revertMigration('20230319123022-user_add_last_login.js');
    }

    initStateHost() {
        const args = process.argv.slice(2);
        if (args.length) {
            this.host = args[0];
        }
    }

    initSession() {
        this.d(".initSession");
        const CONFIG = {
            key: 'koa.sess',
            maxAge: 86400000,
            autoCommit: true,
            overwrite: true,
            httpOnly: true,
            signed: true,
            rolling: false,
            renew: false,
            secure: false,
            sameSite: null,
        };
        this.app.keys = [ config.get('keys.session') ];
        this.app.use(session(CONFIG, this.app));
    }

    initTemplateSystem() {
        this.d(".initTemplateSystem");
        const appDir = path.dirname(require.main.filename);
        this.app.use(serve(appDir + '/public'));
        this.app.use(
            koaTwig({
                views: `${appDir}/` + this.views_path,
                extension: "twig",
                errors: false,
/*
                errors: {
                    401: "401",
                    403: "403",
                    404: "404",
                    500: "500"
                },
*/
                data: { NODE_ENV: process.env.NODE_ENV },
            })
        );
    }

    initContextState() {
        this.d(".initContextState");
        this.app.use(async (ctx, next) => {
            ctx.state.settings = config.get('settings');
            ctx.state.urlWithoutQuery = ctx.origin + ctx.path;
            await next();
        });
    }

    initLogs = () => {
        this.d(".initLogs");
        if (config.get("log.enabled")) {
            // логирование в файл
            this.app.use(morgan('common', {
                stream: fs.createWriteStream(config.get("log.path"), { flags: 'a' })
            }));
            // Логирование в консоль
            this.app.use(Logger());
        }
    }

    /**
     * https://www.npmjs.com/package/koa2-swagger-ui
     */
    initSwagger() {
        const filename = config.get('swagger.file');
        this.d(".initSwagger " + filename);
        const spec = path.extname(filename) === '.yaml'
            ? yamljs.load(filename)
            : require(filename);
        this.app.use(
            koaSwagger({
                routePrefix: config.get('swagger.route'),
                swaggerOptions: { spec },
            }),
        );
    }

    /**
     * Старт сервера без сокетов
     */
    startServer() {
        const port = process.env.PORT || config.get('server.port');
        this.d(".startServer port:" + port);
        this.app.listen(port, () => {
            this.w(": server started");
            notifier.emit('onServerStarted', this.app);
        });
    }

}

module.exports = Init;