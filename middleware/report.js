const log4js = require('log4js');
const fs = require('fs');
const dateFormat = require('dateformat');

class Report {
    constructor() {
    }

    static getInstance() {
        if(!this.instance) {
            this.instance = new Report();
        }

        return this.instance;
    }

    async init(report_path) {
        if (!fs.existsSync(report_path)) {
            fs.mkdirSync(report_path);
        }

        let time = dateFormat(new Date(), "yyyy-mm-dd HH:MM:ss");
        this._success_report_path = report_path +  "/" + time + ".success";
        this._fail_report_path = report_path +  "/" + time + ".fail";

        log4js.configure({
            appenders: {
                success: { type: 'file', filename: this._success_report_path },
                failure: { type: 'file', filename: this._fail_report_path }
            },
            categories: {
                default: { appenders: ['success'], level: 'info' },
                success: { appenders: ['success'], level: 'info' },
                failure: { appenders: ['failure'], level: 'info' }
            }
        });

        this._success_report = log4js.getLogger("success");
        this._fail_report = log4js.getLogger("failure");
    }

    successReport(msg) {
        this._success_report.info(msg);
    }

    failReport(msg) {
        this._fail_report.error(msg);
    }
}

module.exports = Report;