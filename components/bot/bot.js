const util                 = require('node:util');
const config               = require("config");
const md5                  = require('md5');
const { Telegraf, Markup } = require("telegraf");
const LocalSession         = require("telegraf-session-local");
const constants            = require("./constants.js");
const Log                  = require("../log.js");
const Utils                = require("../utils.js");
const { models }           = require("../db.js");
const notifier             = require("../notifier.js");


class Bot extends Log {

    name = "Bot";

    constructor() {
        super();
        (async () => {
            const bot = new Telegraf(config.get("tg.token"));
            this.bot = bot;
            bot.use((new LocalSession({ database: 'tmp/session.json' })).middleware());
            process.once('SIGINT', () => bot.stop('SIGINT'));
            process.once('SIGTERM', () => bot.stop('SIGTERM'));
            await this.initCommands();
            await bot.launch();
        })();
        notifier.on('send_code', this.sendCode.bind(this));
    }

    async sendCode(chat_id, code) {
        this.d(".sendCode chat_id", chat_id, code);
        const message = await this.render('code.twig', { code: code });
        await this.bot.telegram.sendMessage(chat_id, message);
    }

    async render(template, data) {
        return await Utils.renderFile('./views/bot/' + template, data);
    }

    /**
     * Создает клавиатуру для чата юзера
     * @returns {(string)[][]}
     */
    createKeyboard() {
        return [
            [ constants.BOT_CABINET ]
        ];
    }

    async initCommands() {
        this.d(".initCommands");
        this.bot.command('start', this.start.bind(this));
        this.bot.hears(constants.BOT_CABINET, this.cabinet.bind(this));
        this.bot.action('get_discount', this.getDiscount.bind(this));
        this.bot.action('open_site', this.getDiscount.bind(this));
        this.bot.on('text', this.onMessage.bind(this));
    }

    async start(ctx) {
        console.log(`bot.command start`, ctx.message.from);

        const user = await this.createUser(ctx.message.from.first_name, ctx.message.from.id);

        Markup.removeKeyboard(true);
        return await ctx.reply(
            'Бот запущен',
            Markup.keyboard(this.createKeyboard())
                .oneTime()
                .resize()
        );
    }

    async onMessage(ctx) {
        try {
            let user = await models.User.findOne({
                where: {
                    tg_chat_id: ctx.message.from.id
                }
            });
            if (!user) {
                user = await this.createUser(ctx.message.from.first_name, ctx.message.from.id);
            }
        } catch (ex) {
            console.log(ex);
        }
    }

    async cabinet(ctx) {
        this.d(".cabinet", ctx.message);
        const user = await models.User.findOne({
            where: {
                tg_chat_id: ctx.message.from.id,
                active: 1
            }
        });
        console.log(user);
        if (user) {
            const message = await this.render('cabinet.twig', user);
            await ctx.reply(message,
                Markup.inlineKeyboard([
                    Markup.button.callback('Получить', 'get_discount'),
                    Markup.button.url('Открыть сайт', util.format(config.get("tg.cabinet_url"), user.hash)),
                ])
            );
        }
    }

    async getDiscount(ctx) {
        this.d(".getDiscount", ctx.update.callback_query.from.id);

        const user = await models.User.findOne({
            where: {
                tg_chat_id: ctx.update.callback_query.from.id,
                active: 1
            }
        });

        const card = await models.Card.getRandom();

        const user_card = models.UserCard.create({
            user_id: user.user_id,
            card_id: card.card_id,
            dt: new Date()
        });
        // добавляет только уникальные записи
        //await user.addCard(card, { through: { dt: new Date() } });

        await user.addPoints(card.points);
        const message = await this.render('card.twig', card);

        ctx.answerCbQuery();
        ctx.reply(message);
    }

    async createUser(nick, chat_id) {
        try {
            const data = {
                user_name: nick,
                tg_chat_id: chat_id,
                hash: md5(new Date()),
                last_login_dt: new Date()
            }
            return await models.User.create(data, {});
        } catch (ex) {
            console.log(ex);
        }
    }

}

module.exports = new Bot();