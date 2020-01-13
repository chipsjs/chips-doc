const log4js = require('log4js');
const fs = require('fs');
const moment = require('moment');

const Base = require("../lib/base_class");

class Report extends Base.factory(){
    constructor() {
        super();
        this._success_report_queue = [];
        this._fail_report_queue = [];
    }

    static initialize({report_path}) {
        this.loadInstance({
            read_only_properties: {
                report_path: report_path
            }
        });

        if (!fs.existsSync(report_path)) {
            fs.mkdirSync(report_path);
        }

        let time = moment().format('YYYY-M-D h:mm:ss');
        log4js.configure({
            appenders: {
                report: { type: 'file', filename: report_path +  "/" + time + ".report" }
            },
            categories: {
                default: { appenders: ['success'], level: 'info' }
            }
        });
    }

    addReport(result) {
        if(result.success_flag === true) {
            this._success_report_queue.push(result.msg);
        } else {
            this._fail_report_queue.push(result.msg);
        }
    }

    report() {
        if(!this._logger) {
            this._logger = log4js.getLogger();
        }

        this._fail_report_queue.forEach(ele => this._logger.error(ele));
        this._success_report_queue.forEach(ele => this._logger.info(ele));

        this._logger.info("***************************************");
        this._logger.info("Result: success reports is " + this._success_report_queue.length);
        this._logger.info("Result: failure reports is " + this._fail_report_queue.length);

    }
}

module.exports = Report;