const _ = require('lodash');

const Task = require('./task');
const Report = require('./report');
const { loop } = require('../../lib');

class TaskFlow {
  constructor(user, log_module) {
    this._logger = log_module || console;
    this._reporter = new Report(user);
    this._context = {};
  }

  /**
   *
   *
   * @static
   * @param {string} step_name - step n's name, eg: '/user/:id@1'
   * @returns {{method_type: string, url: string}} eg: {'Get', '/user/:id'}
   * @memberof TaskFlow
   */
  static getApiInfoFromStepName(step_name) {
    const [method_type, api_name_with_suffix] = step_name.split(' ');

    const pos = api_name_with_suffix.indexOf('@');
    if (pos !== -1) {
      return {
        method_type,
        url: api_name_with_suffix.substr(0, pos)
      };
    }

    return { method_type, url: api_name_with_suffix };
  }

  // /**
  //  *
  //  *
  //  * @param {object} response_data - http response
  //  * @param {object} context_data - todo
  //  * @memberof TaskFlow
  //  */
  // _updateContext(response_data, context_data) {
  //   if (typeof context_data !== 'object' || Object.keys(context_data).length === 0) {
  //     Object.keys(this._context).forEach((key) => {
  //       if (_.has(response_data, key) && typeof response_data[key] !== 'undefined' && typeof response_data[key] !== 'object') {
  //         _.set(this._context, key, response_data[key]);
  //       }
  //     });
  //     return;
  //   }

  //   Object.entries(context_data).forEach(([key, value]) => {
  //     if (typeof value === 'string') {
  //       // _.set(this)
  //     } else if (typeof value === 'object') {
  //       // to do
  //     }
  //   });
  // }

  // /**
  //  *
  //  *
  //  * @param {object} response_data
  //  * @param {object} controller_data - key is 'a.key.subkey'
  //  * @memberof TaskFlow
  //  */
  // _updateController(response_data, controller_data) {
  //   Object.entries(controller_data).forEach(([key, value]) => {
  //     if (_.has(response_data, key)) {
  //     }
  //   });
  // }

  // _controlFlow(step_name) {

  // }

  /**
   *
   *
   * @param {object} swagger - swagger document
   * @param {{flow: string[], context: string[], extension: object}} api_flow - flow
   * @param {object} headers - http headers
   * @memberof TaskQueue
   */
  async execute(swagger, api_flow, headers = {}) {
    let current_step_name = '';
    const { flow, context, extension } = api_flow;

    try {
      if (Array.isArray(context)) {
        this._context = context.reduce((result, key) => {
          _.set(result, key, null);
          return result;
        }, {});
      }

      await loop.forEach(flow.values(), async (step_name) => {
        current_step_name = step_name;

        const { method_type, url } = TaskFlow.getApiInfoFromStepName(step_name);

        const task = new Task({
          task_id: step_name,
          swagger,
          url,
          method_type,
          extension,
          headers,
          context_params: this._context
        });

        const {
          new_url, data, params, response
        } = await task.run();

        this._reporter.addReport(step_name, new_url, params, data, response);
        // this._updateContext(response.data, _.get(extension, [step_name, 'response', 'context']));
        // this._updateController(response.data, _.get(extension, [step_name, 'response', 'controller']))
      });
    } catch (err) {
      this._reporter.addFailReport(current_step_name, err.response, err.message);
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

  readReport() {
    return this._reporter.readReport();
  }
}

module.exports = TaskFlow;
