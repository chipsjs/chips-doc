const fake = require('openapi-sampler');
const _ = require('lodash');

const { Swagger, request: httpRequest } = require('../../lib');

class Task {
  /**
   * Creates an instance of Task.
   *
   * @param {{url: string, method_type: string,
   *  operation_obj: object, real_data: object, path_parameters: object[]
   * }} instance - instance args
   * @memberof Task
   */
  constructor({
    url, method_type, operation_obj, real_data, path_parameters = []
  }) {
    this._url = url;
    this._method_type = method_type;
    this._operation_object = operation_obj;
    this._path_parameters = path_parameters;
    this._real_data = real_data;
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
    if (typeof schema !== 'object') return {};

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
   * @returns {{new_url: string, data: object, params: object, response: object}} - request info
   * @memberof Task
   */
  async request() {
    const params = Task._fakeQuery(
      Swagger.getParametersSchema(this._operation_object),
      this._real_data
    );
    const data = Task._fakeBody(
      Swagger.getRequestBodySchema(this._operation_object),
      this._real_data
    );
    const new_url = Task._fakePath(
      this._url,
      this._path_parameters,
      this._real_data
    );

    const response = await httpRequest(new_url, this._method_type, {
      params,
      data
    })

    return {
      new_url, data, params, response
    };
  }
}

module.exports = Task;
