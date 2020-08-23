const fake = require('openapi-sampler');
const _ = require('lodash');
const config = require('config');
const dataValidate = require('jsonschema').validate;

const { Swagger, http } = require('../../../lib');
const BaseExtension = require('./base_extension');

class HttpClient extends BaseExtension {
  static _generateRealData(specific_data, context_data, path, schema) {
    // specific data is higest priority
    if (_.has(specific_data, path)) {
      return _.get(specific_data, path);
    }

    // context_data is the second priority
    if (_.has(context_data, ['scope', path])) {
      const key = _.get(context_data, ['scope', path]);
      const context_parmas = _.get(context_data, ['params', key]);
      if (context_parmas) {
        return context_parmas;
      }
    }

    // schema is the lowest
    if (schema) {
      return fake.sample(schema);
    }

    return '';
  }

  /**
   *
   *
   * @static
   * @param {object} schema - a openapi shcema object
   * @param {object} specific_data - specific_data
   * @param {object} context_data - context_data
   * @returns {object} final_data - object in request body
   * @memberof Task
   */
  static _fakeBody(schema, specific_data, context_data) {
    if (typeof schema !== 'object' || Object.keys(schema).length === 0) return {};

    const fake_data = fake.sample(schema);

    const context_scope = _.get(context_data, ['scope'], {});
    Object.entries(context_scope).forEach(([key, value]) => {
      if (_.has(fake_data, key) && !!_.get(context_data, ['params', value])) {
        _.set(fake_data, key, _.get(context_data, ['params', value]));
      }
    });

    Object.entries(specific_data).forEach(([key, value]) => {
      if (_.has(fake_data, key)) {
        _.set(fake_data, key, value);
      }
    });

    return fake_data;
  }

  static _fakeHeader(parameters, specific_data, context_data) {
    if (!Array.isArray(parameters)) return {};

    return parameters.reduce((result, item) => {
      if (item.in !== 'header') return result;

      const real_data = HttpClient._generateRealData(
        specific_data, context_data, item.name, item.schema
      );
      _.set(result, [item.name], real_data);

      return result;
    }, {})
  }

  /**
   *
   *
   * @static
   * @param {object[]} parameters - parameters which is openapi format
   * @param {object} specific_data - data is specific data
   * @param {object} context_data - data is context data
   * @returns {object} - query data
   * @memberof Task
   */
  static _fakeQuery(parameters, specific_data, context_data) {
    if (!Array.isArray(parameters)) return {};

    return parameters.reduce((result, item) => {
      if (item.in !== 'query') return result;

      const real_data = HttpClient._generateRealData(
        specific_data, context_data, item.name, item.schema
      );
      _.set(result, [item.name], real_data);

      return result;
    }, {})
  }

  /**
   * @static
   * @param {string} api_name - api name
   * @param {object[]} path_parameters - swagger parameters about path
   * @param {object} specific_data - data is specific data
   * @param {object} context_data - data is context data
   * @returns {string} api_url
   * @memberof Task
   */
  static _fakePath(api_name, path_parameters, specific_data, context_data) {
    if (!Array.isArray(path_parameters) || path_parameters.length === 0) return api_name;

    const path_fake_data = path_parameters.reduce((result, item) => {
      if (item.in !== 'path') return result;

      const real_data = HttpClient._generateRealData(
        specific_data, context_data, item.name, item.schema
      );
      _.set(result, [item.name], real_data);

      return result;
    }, {})

    const new_url = Object.entries(path_fake_data).reduce((temp_url, [key, value]) => {
      if (temp_url.indexOf(`/:${key}/`) !== -1) {
        return temp_url.replace(`/:${key}/`, `/${value}/`);
      }

      if (temp_url.substr(temp_url.length - key.length - 1) === `:${key}`) {
        return `${temp_url.substr(0, temp_url.length - key.length - 1)}${value}`;
      }

      return temp_url;
    }, api_name);

    return new_url;
  }

  /**
   * fake data & http request
   *
   * @param {object} ctx - options
   * @returns {{new_url: string, data: object, params: object, response: object}} - request info
   * @memberof Task
   */
  static async run(ctx) {
    const {
      url, headers, method_type
    } = ctx;

    const {
      operation_obj, path_parameters, specific_data, context_data
    } = HttpClient._parseArgs(ctx);

    if (typeof operation_obj !== 'object') {
      throw new TypeError(`${url} no exist in swagger`);
    }

    const fake_headers = HttpClient._fakeHeader(
      Swagger.getParametersSchema(operation_obj),
      specific_data, context_data
    );

    const params = HttpClient._fakeQuery(
      Swagger.getParametersSchema(operation_obj),
      specific_data, context_data
    );
    const body = HttpClient._fakeBody(
      Swagger.getRequestBodySchema(operation_obj),
      specific_data, context_data
    );
    const new_url = HttpClient._fakePath(
      url,
      path_parameters,
      specific_data, context_data
    );

    const response = await http.request({
      base_url: config.get('mock_server'),
      path: new_url,
      method: method_type,
      params,
      body,
      headers: _.merge({}, fake_headers, headers)
    });

    _.set(ctx, ['public', ctx.task_id, 'result'], {
      new_url, body, params, response
    });

    await HttpClient._validatorResponse(
      response,
      Swagger.getResponseSchema(operation_obj)
    );
  }

  static _parseArgs(ctx) {
    return {
      operation_obj: ctx.operation_obj,
      path_parameters: ctx.path_parameters,
      specific_data: _.get(ctx, [this.type, 'params', 'request'], {}),
      context_data: _.get(ctx, ['public', 'context'])
    }
  }

  /**
   * validator reponse by swagger's response shcema
   *
   * @param {object} response - http response
   * @param {string} response.status - http status code
   * @param {object} response.data - http response body
   * @param {object} schema - openapi response schema
   * @returns {Promise} - success
   * @memberof HttpClient
   */
  static async _validatorResponse(response, schema) {
    if (response.status !== 200) {
      return Promise.reject(new Error(`request fail, status code is ${response.status}`));
    }

    const result = dataValidate(response.data, schema);
    if (Array.isArray(result.errors) && result.errors.length !== 0) {
      return Promise.reject(new Error(`${result.errors.toString()}`));
    }

    return Promise.resolve();
  }
}

module.exports = HttpClient;
