const _ = require('lodash');
const dataValidate = require('jsonschema').validate;

const Task = require('./task');
const Report = require('./report');
const { loop, Swagger } = require('../../lib');

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

  /**
   *
   *
   * @param {object} response_data - http response
   * @param {object} need_update_context_data - todo
   * @memberof TaskFlow
   */
  _updateContext(response_data, need_update_context_data) {
    if (typeof need_update_context_data !== 'object' || Object.keys(need_update_context_data).length === 0) {
      Object.keys(this._context).forEach((key) => {
        if (_.has(response_data, key) && typeof response_data[key] !== 'undefined' && typeof response_data[key] !== 'object') {
          _.set(this._context, key, response_data[key]);
        }
      });
      return;
    }

    Object.entries(need_update_context_data).forEach(([key, value]) => {
      if (typeof value === 'string') {
        // _.set(this)
      } else if (typeof value === 'object') {
        // to do
      }
    });
  }

  /**
   * validator reponse by swagger's response shcema
   *
   * @param {string} step_name - step n in the flow, eg: 'Get /test/id'
   * @param {object} response - http response
   * @param {string} response.status - http status code
   * @param {object} response.data - http response body
   * @param {object} schema - openapi response schema
   * @memberof TaskFlow
   */
  _validatorResponse(step_name, response, schema) {
    if (response.status !== 200) {
      this._reporter.addFailReport(step_name, response, 'request fail');
    } else {
      const result = dataValidate(response.data, schema);
      if (Array.isArray(result.errors) && result.errors.length !== 0) {
        this._reporter.addFailReport(step_name, response, `${result.errors.toString()}`);
      }
    }
  }

  /**
   *
   *
   * @param {object} swagger - swagger document
   * @param {{flow: string[], context: string[], extension: object}} api_flow - flow
   * @memberof TaskQueue
   */
  async execute(swagger, api_flow) {
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
        const operation_obj = Swagger.getOperationObjectFromSwagger(swagger, url, method_type);
        if (typeof operation_obj !== 'object') {
          throw new TypeError(`${url} no exist in swagger`);
        }

        const task = new Task({
          url,
          method_type,
          operation_obj,
          real_data: _.merge({}, this._context, _.get(extension, [step_name, 'request'])),
          path_parameters: Swagger.getPathParameters(swagger, url)
        });

        const {
          new_url, data, params, response
        } = await task.request();

        this._reporter.addReport(step_name, new_url, params, data, response);
        this._validatorResponse(
          step_name, response,
          Swagger.getResponseSchema(operation_obj)
        );

        this._updateContext(response.data, _.get(extension, [step_name, 'response']));
      });
    } catch (err) {
      this._reporter.addFailReport(current_step_name, {}, err.message);
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
