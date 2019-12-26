const log4js = require('log4js');
// const fs = require('fs');
// const dateFormat = require('dateformat');

class Log {
    constructor() {
        this.logger = log4js.getLogger();
    }

    static getInstance() {
        if(!this.instance) {
            this.instance = new Log();
        }

        return this.instance;
    }

    init() {
        this._init();
    }

    _init() {
        //输出到命令台,todo 设置日志等级以及未来设置日志等级以及未来可以输出到文件可以输出到文件
        this.logger.level = 'debug';
    }

    error(msg) {
        this.logger.error(msg);
    }
    info(msg) {
        this.logger.info(msg);
    };

    debug(msg) {
        this.logger.debug(msg);
    };
}

module.exports = Log;