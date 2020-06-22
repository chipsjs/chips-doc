const log4js = require('log4js');
const fs = require('fs');
const moment = require('moment');

const config = require('config');

const base_path = config.get('report_path') || './';
const max_report_num = config.get('max_report_num');

if (!fs.existsSync(base_path)) {
  fs.mkdirSync(base_path);
}

class Report {
  constructor(reporter) {
    this._report_queue = [];
    this._fail_report_queue = [];
    this._logger = this.initReport(reporter);
  }

  initReport(reporter) {
    const report_path = `${base_path}/${reporter}`
    if (!fs.existsSync(report_path)) {
      fs.mkdirSync(report_path);
    } else {
      const file = fs.readdirSync(report_path);
      if (file.length >= max_report_num) {
        fs.unlinkSync(`${report_path}/${file[0]}`);
      }
    }

    // TODO, 未来同一个reporter只留三份report
    const time = moment().format('YYYY-M-D h:mm:ss');
    this._report_path = `${report_path}/${time}.report`;
    log4js.configure({
      appenders: {
        report: { type: 'file', filename: this._report_path }
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
   * @param {string} url
   * @param {string} method_type
   * @param {object} response
   * @memberof Report
   */
  addResponseReport(url, method_type, response) {
    if (response.status !== 200) {
      this._fail_report_queue.push({
        url,
        method_type,
        response,
        isRequest: false
      });
    }

    this._report_queue.push({
      url,
      method_type,
      response,
      isRequest: false
    });
  }

  /**
   *
   *
   * @param {string} url
   * @param {string} method_type
   * @param {object} query
   * @param {object} data
   * @memberof Report
   */
  addRequestReport(url, method_type, query, data) {
    this._report_queue.push({
      url,
      method_type,
      query,
      data,
      isRequest: true
    });
  }

  report() {
    this._logger.info(`******fail report: ${this._fail_report_queue.length} errors******`);
    this._fail_report_queue.forEach((ele) => this._logger.info(ele));
    this._logger.info('***************************************');
    this._logger.info('******normal reports******');

    this._report_queue.forEach((ele) => {
      const { url, method_type, isRequest } = ele;

      if (isRequest) {
        this._logger.info(`REQUEST::url: ${url}, method: ${method_type}, query: ${JSON.stringify(ele.query)}, data: ${JSON.stringify(ele.data)}`);
      } else {
        this._logger.info(`RESPONSE::url: ${url}, method: ${method_type}, response: ${JSON.stringify(ele.response)}`);
      }
    });
  }

  outputReport() {
    return this._report_queue;
  }

  outputFailedReport() {
    return this._fail_report_queue;
  }

  readReport() {
    return fs.readFileSync(this._report_path);
  }

  destoryReport() {
    return fs.unlinkSync(this._report_path);
  }
}

module.exports = Report;
