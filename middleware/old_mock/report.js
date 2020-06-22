const log4js = require('log4js');
const fs = require('fs');
const moment = require('moment');

const config = require('config');

const base_path = config.get('report_path');
if (!fs.existsSync(base_path)) {
  fs.mkdirSync(base_path);
}

class Report {
  constructor(reporter) {
    this._report_queue = [];
    this._fail_report_queue = [];
    this._reporter = reporter;
    this._logger = this.initReport(reporter);
  }

  static initReport(reporter) {
    const report_path = `${base_path}/${reporter}`
    if (!fs.existsSync(report_path)) {
      fs.mkdirSync(report_path);
    }

    const time = moment().format('YYYY-M-D h:mm:ss');
    log4js.configure({
      appenders: {
        report: { type: 'file', filename: `${report_path}/${time}.report` }
      },
      categories: {
        default: { appenders: ['report'], level: 'info' }
      }
    });

    return log4js.getLogger();
  }

  /**
   *
   *
   * @param {string} message - report message
   * @param {boolean} [success_flag=true]
   * @memberof Report
   */
  addReport(message, success_flag = true) {
    if (success_flag === true) {
      this._report_queue.push(message);
    } else {
      this._fail_report_queue.push(message);
      this._report_queue.push(message);
    }
  }

  report() {
    this._logger.info(`******fail report: ${this._report_queue.length} errors******`);
    this._fail_report_queue.forEach((ele) => this._logger.info(ele));
    this._logger.info('***************************************');
    this._logger.info('******normal reports******');
    this._report_queue.forEach((ele) => this._logger.info(ele));
  }
}

module.exports = Report;
