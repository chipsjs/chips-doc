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

    // TODO, 文件名排序, 直接取0有问题
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
   * @param {string} api_info_name - eg: 'POST /test@1'
   * @param {object} response
   * @param {string} response.status
   * @param {object} response.data
   * @param {string} message - err message
   * @memberof Report
   */
  addFailReport(api_info_name, response, message) {
    this._fail_report_queue.push({
      api_info_name,
      response,
      message
    });
  }

  /**
   *
   *
   * @param {string} api_info_name - eg: 'POST /test@1'
   * @param {string} url - eg: 'POST /test'
   * @param {object} query
   * @param {object} data
   * @param {object} response
   * @memberof Report
   */
  addRequestReport(api_info_name, url, params, data, response) {
    this._report_queue.push({
      api_info_name,
      url,
      params,
      data,
      isRequest: true
    });

    this._report_queue.push({
      api_info_name,
      url,
      response,
      isRequest: false
    });
  }

  report() {
    this._logger.info(`******fail report: ${this._fail_report_queue.length} errors******`);
    this._fail_report_queue.forEach((ele) => {
      this._logger.info(`Fail::api name: ${ele.api_info_name}, response: ${JSON.stringify(ele.response)}, message: ${ele.message}`);
    });
    this._logger.info('------------------------------------');
    this._logger.info('******normal reports******');

    this._report_queue.forEach((ele) => {
      if (ele.isRequest) {
        this._logger.info(`REQUEST::api name: ${ele.api_info_name}, url: ${ele.url}, query: ${JSON.stringify(ele.params)}, data: ${JSON.stringify(ele.data)}`);
      } else {
        this._logger.info(`RESPONSE::api name: ${ele.api_info_name}, url: ${ele.url}, response: ${JSON.stringify(ele.response)}`);
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
