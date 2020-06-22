const _ = require('lodash');

const Task = require('./task');
const Report = require('./report');
const { loop, Swagger } = require('../../lib');

class TaskFlow {
  constructor(user, log_module) {
    this._logger = log_module || console;
    this._reporter = new Report(user);
  }

  /**
   *
   *
   * @param {object} response_data
   * @param {object} need_update_context_data
   * @memberof TaskFlow
   */
  _updateContext(response_data, need_update_context_data) {
    if (typeof need_update_context_data === 'undefined') return;

    Object.entries(need_update_context_data).forEach(([key, value]) => {
      if (typeof value === 'string') {
        // _.set(this)
      } else if (typeof value === 'object') {
        // to do
      }
    });
  }

  /**
   *
   *
   * @param {object} swagger
   * @param {object} api_flow
   * @param {array} api_flow.flow - array of string , string is api info name,
   *  such as ["post /User", "post /Validation_1", "post /Validation_2"]
   * @param {object} api_flow[api_info_name] -
   * key is api info name, value is the specific param in this api
   * @memberof TaskQueue
   */
  async excute(swagger, api_flow) {
    this._context = api_flow.context || {};

    try {
      await loop.forEach(api_flow.flow.values(), async (api_info_name) => {
        const [method_type, api_name] = api_info_name.split(' ');
        const operation_obj = Swagger.getOperationObjectFromSwagger(swagger, api_name, method_type);
        if (typeof operation_obj !== 'object') {
          this._reporter.addReport(`${api_name} no exist in swagger`, false);
          throw new TypeError(`${api_name} no exist in swagger`);
        }

        const task = new Task(
          api_name,
          method_type,
          operation_obj,
          _.merge({}, this._context, _.get(api_flow, [api_info_name, 'request'])),
          Swagger.getPathParameters(swagger, api_name)
        );

        const {
          url, data, query, response
        } = await task.request();

        this._reporter.addRequestReport(url, method_type, query, data);
        this._reporter.addResponseReport(url, method_type, response);
        if (response.status !== 200) {
          throw new TypeError(`${api_name} request fail`);
        }

        this._updateContext(response.data, _.get(api_flow, [api_info_name, 'response']));
      });
    } catch (err) {
      this._logger.error(`TaskQueue::excute fail, err msg is ${err.message}`);
    }

    this._reporter.report();
  }

  outputReport() {
    return this._reporter.outputReport();
  }

  destoryReport() {
    return this._reporter.destoryReport();
  }
}

module.exports = TaskFlow;

// 加载任务，加载公用数据到loader中
