const fs = require('fs');
const config = require('config');
const _ = require('lodash');

const base_path = config.get('report_path') || './';
const max_report_num = config.get('max_report_num');

if (!fs.existsSync(base_path)) {
  fs.mkdirSync(base_path);
}

const _initReport = (reporter) => {
  let report_path = `${base_path}/${reporter}`
  if (!fs.existsSync(report_path)) {
    fs.mkdirSync(report_path);
  } else {
    const file = fs.readdirSync(report_path);
    if (file.length >= max_report_num) {
      fs.unlinkSync(`${report_path}/${file[0]}`);
    }
  }

  // TODO, 文件名排序, 直接取0有问题
  const time = new Date().toISOString();
  report_path = `${report_path}/${time}.report`;
  return report_path;
}

class Report {
  constructor(reporter) {
    this._report_queue = [];
    this._fail_report_queue = [];
    this._report_path = _initReport(reporter);
  }

  /**
   *
   *
   * @param {string} api_info_name - eg: 'POST /test@1'
   * @param {object} response - http response
   * @param {string} response.status - response status code
   * @param {object} response.data - response response body
   * @param {string} message - err message
   * @memberof Report
   */
  addFailReport(api_info_name, response = {}, message) {
    const { data, status } = response;
    this._fail_report_queue.push({
      api_info_name,
      response: {
        data, status
      },
      message
    });
  }

  /**
   * @param {string} api_info_name - eg: 'POST /test@1'
   * @param {string} url - eg: 'POST /test'
   * @param {object} params - query data
   * @param {object} data - request body
   * @param {object} response - response data
   * @returns {undefined}
   * @memberof Report
   */
  addReport(api_info_name, url, params, data, response) {
    const { data, status } = response;

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
      response: {
        data, status
      },
      isRequest: false
    });
  }

  report() {
    const buffer_arr = [];

    buffer_arr.push(Buffer.from(`--------FAIL REPORTS: ${this._fail_report_queue.length} error--------\n`));
    this._fail_report_queue.forEach((ele) => {
      buffer_arr.push(Buffer.from(`Fail::api name: ${ele.api_info_name}, response: ${JSON.stringify(ele.response)}, message: ${ele.message}\n`));
    });
    buffer_arr.push(Buffer.from('------------------------------------\n'));
    buffer_arr.push(Buffer.from(`--------NORMAL REPORTS: ${this._report_queue.length} reports--------\n`));

    this._report_queue.forEach((ele) => {
      if (ele.isRequest) {
        buffer_arr.push(Buffer.from(`REQUEST::api name: ${ele.api_info_name}, url: ${ele.url}, query: ${JSON.stringify(ele.params)}, data: ${JSON.stringify(ele.data)}\n`));
      } else {
        buffer_arr.push(Buffer.from(`RESPONSE::api name: ${ele.api_info_name}, url: ${ele.url}, response: ${JSON.stringify(ele.response)}\n`));
      }
    });

    fs.writeFileSync(this._report_path, Buffer.concat(buffer_arr));
  }

  outputReport() {
    return this._report_queue;
  }

  outputFailedReport() {
    return this._fail_report_queue;
  }

  readReport() {
    if (fs.existsSync(this._report_path)) {
      return fs.readFileSync(this._report_path);
    }
    return '';
  }

  destoryReport() {
    return fs.unlinkSync(this._report_path);
  }
}

module.exports = Report;
