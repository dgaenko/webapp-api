const config = require("config");
/**
 * Класс для логирования в консоль из кода
 */
class Log {

    enable = true;

    /**
     * Конструктор логера
     * @param string name   Имя класса или модуля от куда производится вывод в консоль
     */
    constructor(name = 'Log') {
        this.name = name;

        this.enable = config.get("log.enabled");

        this.clc = require("cli-color");

        this.error = this.clc.red.bold;
        this.warn = this.clc.yellow;
        this.notice = this.clc.blue;
    }

    e(method, ...args) {
        if (this.enable) {
            //console.log(this.error(args));
            if (args.length) {
                console.log(this.clc.greenBright(this.name) + method, this.error(args));
            } else {
                console.log(this.clc.greenBright(this.name) + method);
            }
        }
    }

    w(method, ...args) {
        if (this.enable) {
            console.log(this.warn(args));
            if (args.length) {
                console.log(this.warn(this.name) + method, this.error(args));
            } else {
                console.log(this.warn(this.name) + method);
            }
        }
    }

    n(...args) {
        if (this.enable) {
            console.log(this.notice(args));
        }
    }

    l(module, args) {
        if (this.enable) {
            console.log(this.clc.greenBright(module) + args);
        }
    }

    d(method, ...args) {
        if (this.enable) {
            if (args.length) {
                console.log(this.clc.greenBright(this.name) + method, args);
            } else {
                console.log(this.clc.greenBright(this.name) + method);
            }
        }
    }

    green(...args) {
        if (this.enable) {
            console.log(this.clc.greenBright(args));
        }
    }

    yellow(...args) {
        if (this.enable) {
            return this.clc.yellowBright(args);
        }
    }

}

module.exports = Log;