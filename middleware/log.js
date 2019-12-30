const log4js = require('log4js');
// const fs = require('fs');
// const dateFormat = require('dateformat');

class Log {
    constructor() {
        this._logger = log4js.getLogger();
    }

    static getInstance() {
        if(!this.instance) {
            this.instance = new Log();
        }

        return this.instance;
    }

    init(log_level) {
        this._init(log_level);
    }

    _init(log_level) {
        //输出到命令台
        this._logger.level = log_level;
    }

    error(msg) {
        this._logger.error(msg);
    }
    info(msg) {
        this._logger.info(msg);
    };

    debug(msg) {
        this._logger.debug(msg);
    };
}

module.exports = Log;