const fs         = require('fs/promises');
const util       = require('util');
const Twig       = require('twig');
const moment     = require("moment");
const CryptoJS   = require("crypto-js");
const RNCryptor  = require('rncryptor-node');

class Utils {

    /**
     * Случайное число в интервале min (включая) и max (не включая)
     */
    static getRandomArbitrary(min, max) {
        return Math.random() * (max - min) + min;
    }

    /**
     * Returns a random integer between min (inclusive) and max (inclusive).
     * The value is no lower than min (or the next integer greater than min
     * if min isn't an integer) and no greater than max (or the next integer
     * lower than max if max isn't an integer).
     * Using Math.round() will give you a non-uniform distribution!
     */
    static getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * Возвращает значение из POST-запроса или параметра
     * @param ctx           Контекст запроса
     * @param name          Имя возвращаемого параметра
     * @returns {null}      Возвращаемое значение
     */
    static getRequestParam(ctx, name) {
        let res = null;
        if (ctx.request.body[name]) {
            res = ctx.request.body[name];
        }
        if (ctx.params[name]) {
            res = ctx.params[name];
        }
        return res;
    }

    /**
     * Возвращает случайную строку из a-z
     * @param length            длина строки
     * @param use_upper         только символы в верхнем регистре
     * @returns {string}
     */
    static getRandomChars(length, use_upper = 0) {
        const chars = use_upper
            ? 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
            : 'abcdefghijklmnopqrstuvwxyz';
        let res = "";
        while (res.length < length) {
            res += chars[Utils.getRandomInt(0, chars.length - 1)];
        }
        return res;
    }

    /**
     * Возвращает случайную строку из a-z n 0-9
     * @param length            длина строки
     * @param use_upper         только символы в верхнем регистре
     * @returns {string}
     */
    static getRandomString(length, use_upper = 0) {
        const chars = use_upper
            ? 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
            : 'abcdefghijklmnopqrstuvwxyz0123456789';
        let res = "";
        while (res.length < length) {
            res += chars[Utils.getRandomInt(0, chars.length - 1)];
        }
        return res;
    }

    /**
     * Возвращает случайную строку из 0-9
     * @param length            длина строки
     * @returns {string}
     */
    static getRandomNumberString(length) {
        const chars = '0123456789';
        let res = "";
        while (res.length < length) {
            res += chars[Utils.getRandomInt(0, chars.length - 1)];
        }
        return res;
    }

    /**
     * Возвращает кол-во слов в строке
     * https://stackoverflow.com/questions/18679576/counting-words-in-string
     * @param s
     * @returns {*}
     */
    static countWords(s) {
        s = s.replace(/\n/g,' ');               // newlines to space
        s = s.replace(/(^\s*)|(\s*$)/gi,'');    // remove spaces from start + end
        s = s.replace(/[ ]{2,}/gi,' ');         // 2 or more spaces to 1
        return s.split(' ').length;
    }

    static async renderTemplate(template, data = {}) {
        let res = "";
        try {
            if (!/\.[^.]+$/.test(template)) {
                template += ".twig";
            }
            const content = await fs.readFile(template, "utf-8");
            const twig = Twig.twig({ data: content });
            res = twig.render(data);
        } catch (ex) {
            res = ex.message;
        }
        return res;
    }

    static async renderFile(filename, data = {}) {
        let res = "";
        try {
            if (!/\.[^.]+$/.test(filename)) {
                filename += ".twig";
            }
            const render = util.promisify(Twig.renderFile);
            res = await render(filename, data);
        } catch (ex) {
            res = ex.message;
        }
        return res;
    }

    static async fileExists(path) {
        let res = true;
        try {
            await fs.stat(path);
        } catch (err) {
            if (err.code = 'ENOENT') {
                // File not found
                res = false;
            } else {
                // Another error!
                res = false;
            }
        }
        return res;
    };

    /**
     * Возвращает сколько минут прошло от указанной даты
     * @param date          Дата, для которой получаем интервал
     * @returns {number}    Кол-во минут
     */
    static minutesFromDate(date) {
        const dt = moment(date);
        let differenceInMs = moment().diff(dt);
        return moment.duration(differenceInMs).asMinutes();
    }

    static parseJwt(token) {
        return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    }

    static encryptString(str, secret) {
        return CryptoJS.AES.encrypt(str, secret).toString();
    }

    static decryptString(encrypted, secret) {
        let res;
        try {
            res = CryptoJS.AES.decrypt(encrypted, secret).toString(CryptoJS.enc.Utf8)
        } catch (ex) {
            console.log(ex);
        }
        return res;
    }

    static encryptStringRnCryptor(str, secret) {
        return RNCryptor.Encrypt(str, secret);
    }

    static decryptStringRnCryptor(encrypted, secret) {
        const decrypted = RNCryptor.Decrypt(encrypted, secret);
        return decrypted.toString();
    }

}

module.exports = Utils;