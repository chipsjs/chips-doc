const queryString = require('query-string');
const { httpRequest, dataValidate } = require('../../lib/assist_macro');
const { header, base_url } = require('../../api_dependence.json');
// to optimize,智能识别所有url并替换,第一期先只要base_url

class Task {
  constructor(task_name, test_case_queue, context, log_module) {
    this._task_name = task_name;
    this._test_case_queue = test_case_queue;
    this._logger = log_module;
    this._context = new Map();

    if (Array.isArray(context) === true && context.length !== 0) {
      context.forEach((ele) => {
        this._context.set(ele, null);
      })
    }
  }

  _check(test_case) {
    if (typeof test_case.url !== 'string' || typeof test_case.method_type !== 'string') {
      throw `${new TypeError(`Task::_check: error! task name is ${this._task_name}`)}. It doesnt have url or method_type`;
    }
  }

  _joinQueryField(query) {
    return queryString.stringify(query);
  }

  _overwriteDataByContext(obj) {
    if (typeof obj !== 'object') return;

    Object.keys(obj).forEach((ele) => {
      if (this._context.has(ele)) {
        const value = this._context.get(ele);
        if (value !== null) {
          obj[ele] = value;
        } else {
          this._context.set(ele, obj[ele]);
        }
      }
    });
  }

  _overwriteContextByResponse(obj) {
    if (typeof obj !== 'object') return;

    Object.keys(obj).forEach((ele) => {
      if (this._context.has(ele)) {
        this._context.set(ele, obj[ele]);
      }
    });
  }

  _replaceUrl(url) {
    return url.replace('{base_url}', base_url);
  }

  async _sendHttpRequest(test_case) {
    let url = this._replaceUrl(test_case.url);

    this._overwriteDataByContext(test_case.query);
    this._overwriteDataByContext(test_case.body);

    if (typeof test_case.query === 'object') {
      url += `?${this._joinQueryField(test_case.query)}`;
    }

    let response = {};
    switch (test_case.method_type) {
      case 'get':
        response = await httpRequest.get({
          url,
          headers: header
        });
        break;
      case 'post':
        response = await httpRequest.post(url, test_case.body);
        break;
      case 'put':
        response = await httpRequest.put(url, test_case.body);
        break;
      case 'delete':
        response = await httpRequest.delete(url, test_case.body);
        break;
      default:
        throw `${new TypeError(`Task::sendHttpRequest: fail! task name is ${this._task_name}`)}. It has unsupported method_type`;
    }

    // response check
    if (response.statusCode === 200) {
      // context overwrite
      const response_body = JSON.parse(response.body);
      this._overwriteContextByResponse(response_body);

      if (typeof test_case.response === 'object' && test_case.response.success === 'object') {
        const result = dataValidate(response_body, test_case.response.success);
        if (Array.isArray(result.errors) && result.errors.length !== 0) throw new TypeError(result.errors.toString());
      }
    } else if (typeof test_case.response === 'object' && test_case.response.failure === 'object') {
      const result = dataValidate(JSON.parse(response.body), test_case.response.failure);
      if (Array.isArray(result.errors) && result.errors.length !== 0) throw new TypeError(result.errors.toString());
    }

    this._logger.debug(`Task::_sendHttpGet:task name is ${this._task_name
    } , api_name is ${test_case.api_name}, result is ${response.body}`);
  }

  async execute() {
    try {
      for (const i in this._test_case_queue) {
        const test_case = this._test_case_queue[i];
        this._check(test_case);

        await this._sendHttpRequest(test_case);
      }

      return {
        msg: `Task:: [${this._task_name}] execute success!!!`,
        success_flag: true
      };
    } catch (e) {
      return {
        msg: `Task:: [${this._task_name}] execute fail!err_msg is ${e.message}`,
        isSuccess: false
      };
    }
  }
}

module.exports = Task;
