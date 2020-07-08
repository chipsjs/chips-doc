const _ = require('lodash');

const Task = require('./task');
const Report = require('./report');
const { loop } = require('../../lib');

class TaskFlow {
  constructor(user, log_module) {
    this._logger = log_module || console;
    this._reporter = new Report(user);
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

  /**
   *
   *
   * @param {object} swagger - swagger document
   * @param {{flow: string[], context: string[], extension: object}} api_flow - flow
   * @param {object} headers - http headers
   * @memberof TaskQueue
   */
  async execute(swagger, api_flow, headers = {}) {
    this.context = {
      current_task_id: '',
      flow: api_flow.flow,
      extensions: api_flow.extensions
    }

    try {
      const context_params = _.get(api_flow, ['context', 'params'], [])
      if (Array.isArray(context_params)) {
        this.context.params = context_params.reduce((result, key) => {
          _.set(result, key, null);
          return result;
        }, {});
      }

      await loop.forEach(this.context.flow.values(), async (task_id) => {
        this.context.current_task_id = task_id;
        this.context.swagger = swagger;

        const { method_type, url } = TaskFlow.getApiInfoFromStepName(task_id);

        const task = new Task({
          url,
          method_type,
          headers,
          context: this.context
        });

        await task.run();

        if (_.has(this.context, [task_id, 'result'])) {
          const {
            new_url, params, body, response
          } = _.get(this.context, [task_id, ['result']]);
          this._reporter.addReport(task_id, new_url, params, body, response);
        }
      });
    } catch (err) {
      this._reporter.addFailReport(this.context.current_task_id, _.get(this.context, ['result', 'response']), err.message);
      this._logger.error(`TaskFlow::excute fail, err msg is ${err.message}`);
    }

    this._reporter.report();
  }

  outputReport() {
    return this._reporter.outputReport();
  }

  outputFailedReport() {
    return this._reporter.outputFailedReport();
  }

  destoryReport() {
    return this._reporter.destoryReport();
  }

  readReport() {
    return this._reporter.readReport();
  }
}

module.exports = TaskFlow;
