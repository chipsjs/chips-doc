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
   * @param {object} response_data
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
   * @param {string} api_info_name
   * @param {object} response
   * @param {string} response.status
   * @param {object} response.data
   * @param {object} schema
   * @memberof TaskFlow
   */
  _validatorResponse(api_info_name, response, schema) {
    if (response.status !== 200) {
      this._reporter().addFailReport(api_info_name, response, 'request fail');
    } else {
      const result = dataValidate(response.data, schema);
      if (Array.isArray(result.errors) && result.errors.length !== 0) {
        this._reporter().addFailReport(api_info_name, response, `${result.errors.toString()}`);
      }
    }
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
  async execute(swagger, api_flow) {
    let step_name = '';

    try {
      if (Array.isArray(api_flow.context)) {
        api_flow.context.forEach((key) => {
          _.set(this._context, key, null);
        })
      }

      await loop.forEach(api_flow.flow.values(), async (api_info_name) => {
        step_name = api_info_name;

        const [method_type, api_name_with_perfix] = api_info_name.split(' ');
        let api_name = api_name_with_perfix;
        const pos = api_name_with_perfix.indexOf('@');
        if (pos !== -1) {
          api_name = api_name_with_perfix.substr(0, pos);
        }
        const operation_obj = Swagger.getOperationObjectFromSwagger(swagger, api_name, method_type);
        if (typeof operation_obj !== 'object') {
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
          url, data, params, response
        } = await task.request();

        this._reporter.addRequestReport(api_info_name, url, params, data, response);
        this._validatorResponse(
          api_info_name, response,
          Swagger.getResponseSchema(operation_obj)
        );

        this._updateContext(response.data, _.get(api_flow, [api_info_name, 'response']));
      });
    } catch (err) {
      this._reporter.addFailReport(step_name, {}, err.message);
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
