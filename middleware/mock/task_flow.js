const _ = require('lodash');

const Task = require('./task');
const Report = require('./report');
const { loop } = require('../../lib');

class TaskFlow {
  /**
   *Creates an instance of TaskFlow.
   *
   * @param {string} user - user name
   * @param {object} options - arg
   * @param {object} options.swaggers - key is version, value is swagger document
   * @param {{flow: string[], context: string[], extension: object}} options.api_flow - flow
   * @param {object} options.headers - http headers
   * @param {*} log_module - log_module
   * @memberof TaskFlow
   */
  constructor(user, { swaggers, api_flow, headers }, log_module) {
    this._logger = log_module || console;
    this._reporter = new Report(user);

    this.context = {
      current_task_id: '',
      headers,
      flow: api_flow.flow,
      swaggers,
      extensions: api_flow.extensions,
      context: this._initContextParams(api_flow.context)
    }
  }

  _initContextParams(flow_context) {
    if (!flow_context) return {};

    const before_convert_params = _.get(flow_context, 'params', {});

    let params;
    // convert array to key value format
    if (Array.isArray(before_convert_params)) {
      params = before_convert_params.reduce((result, key) => {
        // eslint-disable-next-line no-param-reassign
        result[key] = null;
        return result;
      }, {});
    } else if (typeof before_convert_params === 'object') {
      params = before_convert_params;
    } else {
      throw new TypeError(`before_convert_params type error, its type is ${typeof before_convert_params} `);
    }

    // define default scope
    const scope = {};
    Object.keys(params).forEach((key) => {
      scope[key] = key;
    });

    // define addtional scope
    const addtional_scope = _.get(flow_context, 'scope', {});
    Object.entries(addtional_scope).forEach(([key, values]) => {
      if (!Array.isArray(values)) return;

      values.forEach((value) => {
        scope[value] = key;
      });
    });

    return { params, scope };
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

  static updateContextValue(new_context_data, context_key, new_value) {
    const old_value = _.get(new_context_data, ['params', context_key]);
    if (!old_value || typeof old_value === typeof new_value) {
      _.set(new_context_data, ['params', context_key], new_value);
    }
    return new_context_data;
  }

  // do not support path update context
  _updateContextParams(context_data, response, params, body) {
    const new_context_data = _.cloneDeep(context_data);
    const data = _.get(response, 'data');
    const headers = _.get(response, 'headers');
    const context_scope = _.get(new_context_data, 'scope', {});

    Object.entries(context_scope).forEach(([key, value]) => {
      if (_.has(data, key)) {
        const new_value = _.get(data, key);
        TaskFlow.updateContextValue(new_context_data, value, new_value);
        return new_context_data;
      }

      if (_.has(headers, key)) {
        const new_value = _.get(headers, [key, 0]);
        TaskFlow.updateContextValue(new_context_data, value, new_value);
        return new_context_data;
      }

      if (_.has(params, key)) {
        const new_value = _.get(params, key);
        TaskFlow.updateContextValue(new_context_data, value, new_value);
        return new_context_data;
      }

      if (_.has(body, key)) {
        const new_value = _.get(body, key);
        TaskFlow.updateContextValue(new_context_data, value, new_value);
        return new_context_data;
      }

      return new_context_data;
    });

    return new_context_data;
  }

  // update context headers
  _updateContextHeaders(context_headers, context_data) {
    const context_scope = _.get(context_data, 'scope', {});

    Object.entries(context_scope).forEach(([key, value]) => {
      if (_.has(context_headers, key)) {
        const old_value = _.get(context_headers, [key]);
        if (!old_value || typeof old_value === typeof value) {
          _.set(context_headers, key, _.get(context_data, ['params', value]));
        }
      }
    });
  }

  /**
   * quickly run
   *
   * @param {string} user - user name
   * @param {object} options - arg
   * @param {object} options.swaggers - key is version, value is swagger document
   * @param {{flow: string[], context: string[], extension: object}} options.api_flow - flow
   * @param {object} options.headers - http headers
   * @returns {object} {report, fail_report}
   * @memberof TaskFlow
   */
  static async run(user, options) {
    const _instance = new TaskFlow(user, options);
    await _instance.execute();
    return {
      report: _instance.outputReport(),
      fail_report: _instance.outputFailedReport(),
      context: _instance.context,
    }
  }

  /**
   *
   *
   *
   * @memberof TaskQueue
   */
  async execute() {
    try {
      await loop.forEach(this.context.flow.values(), async (task_id) => {
        this.context.current_task_id = task_id;
        const { method_type, url } = TaskFlow.getApiInfoFromStepName(task_id);

        await Task.run({
          url,
          method_type,
          headers: this.context.headers,
          task_id,
          middlewares: _.get(this.context, ['extensions', task_id], []),
          context: this.context
        });

        if (_.has(this.context, [task_id, 'result'])) {
          const result = _.get(this.context, [task_id, ['result']]);
          this.context.context = this._updateContextParams(
            this.context.context, result.response, result.params, result.body
          );
          this._updateContextHeaders(this.context.headers, this.context.context);
          this._reporter.addReport(task_id, result);
        }
      });
    } catch (err) {
      this._reporter.addFailReport(this.context.current_task_id, _.get(this.context, ['result', 'response'], {}), err.message);
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
