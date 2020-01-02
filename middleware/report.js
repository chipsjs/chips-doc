const log4js = require('log4js');
const fs = require('fs');
const moment = require('moment');

const Base = require("../lib/base_class");

class Report extends Base.factory(){
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
                success: { type: 'file', filename: report_path +  "/" + time + ".success" },
                failure: { type: 'file', filename: report_path +  "/" + time + ".fail" }
            },
            categories: {
                default: { appenders: ['success'], level: 'info' },
                success: { appenders: ['success'], level: 'info' },
                failure: { appenders: ['failure'], level: 'info' }
            }
        });
    }

    report(result) {
        if(result.success_flag === true) {
            this._successReport(result.msg);
        } else {
            this._failReport(result.msg);
        }
    }

    _successReport(msg) {
        if(!this._success_report) {
            this._success_report = log4js.getLogger("success");
        }
        this._success_report.info(msg);
    }

    _failReport(msg) {
        if(!this._fail_report_path) {
            this._fail_report = log4js.getLogger("failure");
        }

        this._fail_report.error(msg);
    }
}

module.exports = Report;