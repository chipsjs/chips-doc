const fake = require('openapi-sampler');
const _ = require('lodash');
const dataValidate = require('jsonschema').validate;

const { Swagger, request: httpRequest } = require('../../../lib');

const provider_type = 'HttpClient';

class HttpClient {
  static get type() {
    return provider_type;
  }

  /**
   *
   *
   * @static
   * @param {object} fake_data - fake data from document
   * @param {object} real_data - specific data or context data
   * @returns {object} - final data which is based on fake data and is merged by real data
   * @memberof Task
   */
  static _mergeRequestData(fake_data, real_data) {
    const final_data = _.cloneDeep(fake_data);
    const specific_data = _.pick(real_data, Object.keys(fake_data));

    Object.entries(specific_data).forEach(([key, value]) => {
      if (typeof value === 'object') {
        _.set(final_data, key, this._mergeRequestData(final_data[key], value))
      } else if (value) {
        _.set(final_data, key, value);
      }
    });

    return final_data;
  }

  /**
   *
   *
   * @static
   * @param {object} schema - a openapi shcema object
   * @param {object} real_data - data merged from specific data and context_data
   * @returns {object} final_data - object in request body
   * @memberof Task
   */
  static _fakeBody(schema, real_data) {
    if (typeof schema !== 'object' || Object.keys(schema).length === 0) return {};

    const fake_data = fake.sample(schema);

    const final_data = this._mergeRequestData(fake_data, real_data);

    return final_data;
  }

  /**
   *
   *
   * @static
   * @param {object[]} parameters - parameters which is openapi format
   * @param {object} real_data - data merged from specific data and context_data
   * @returns {object} - query data
   * @memberof Task
   */
  static _fakeQuery(parameters, real_data) {
    if (!Array.isArray(parameters)) return {};

    return parameters.reduce((result, item) => {
      if (item.in !== 'query') return result;

      if (_.has(real_data, [item.name])) {
        _.set(result, [item.name], real_data[item.name])
      } else if (item.schema) {
        _.set(result, [item.name], fake.sample(item.schema));
      } else {
        _.set(result, [item.name], '');
      }

      return result;
    }, {})
  }

  /**
   * @static
   * @param {string} api_name - api name
   * @param {object[]} path_parameters - swagger parameters about path
   * @param {object} real_data - will overwrite fake data
   * @returns {string} api_url
   * @memberof Task
   */
  static _fakePath(api_name, path_parameters, real_data) {
    if (!Array.isArray(path_parameters) || path_parameters.length === 0) return api_name;

    const path_fake_data = path_parameters.reduce((result, item) => {
      if (item.in !== 'path') return result;

      if (_.has(real_data, [item.name])) {
        _.set(result, [item.name], real_data[item.name])
      } else if (item.schema) {
        _.set(result, [item.name], fake.sample(item.schema));
      } else {
        _.set(result, [item.name], '');
      }

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
    } = ctx.task;

    const { operation_obj, path_parameters, real_data } = HttpClient._parseArgs(ctx);

    if (typeof operation_obj !== 'object') {
      throw new TypeError(`${url} no exist in swagger`);
    }

    const params = HttpClient._fakeQuery(
      Swagger.getParametersSchema(operation_obj),
      real_data
    );
    const body = HttpClient._fakeBody(
      Swagger.getRequestBodySchema(operation_obj),
      real_data
    );
    const new_url = HttpClient._fakePath(
      url,
      path_parameters,
      real_data
    );

    const response = await httpRequest(new_url, method_type, {
      params,
      data: body,
      headers
    })

    _.set(ctx, [ctx.current_task_id, 'result'], {
      new_url, body, params, response
    });

    await HttpClient._validatorResponse(
      response,
      Swagger.getResponseSchema(operation_obj)
    );
  }

  static _parseArgs(ctx) {
    const { swagger, params } = ctx;
    const { url, method_type } = ctx.task;

    return {
      operation_obj: Swagger.getOperationObjectFromSwagger(
        swagger, url, method_type
      ),
      path_parameters: Swagger.getPathParameters(swagger, url),
      real_data: _.merge(
        {}, params,
        _.get(ctx, [provider_type, 'params', 'request'], {})
      ),
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
      return Promise.reject(new TypeError('request fail'));
    }

    const result = dataValidate(response.data, schema);
    if (Array.isArray(result.errors) && result.errors.length !== 0) {
      return Promise.reject(new TypeError(`${result.errors.toString()}`));
    }

    return Promise.resolve();
  }
}

module.exports = HttpClient;
