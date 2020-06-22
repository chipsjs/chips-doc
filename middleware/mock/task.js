const fake = require('openapi-sampler');
const _ = require('lodash');

const { Swagger, request: httpRequest } = require('../../lib');

class Task {
  /**
   *Creates an instance of Task.
   * @param {string} api_name
   * @param {string} method_type
   * @param {object} operation_object
   * @param {object} real_data
   * @param {array} path_parameters
   * @memberof Task
   */
  constructor(api_name, method_type, operation_object, real_data, path_parameters = []) {
    this._api_name = api_name;
    this._method_type = method_type;
    this._operation_object = operation_object;
    this._path_parameters = path_parameters;
    this._real_data = real_data;
  }

  /**
   *
   *
   * @static
   * @param {object} fake_data
   * @param {object} real_data
   * @returns
   * @memberof Task
   */
  static _mergeRequestData(fake_data, real_data) {
    const final_data = _.cloneDeep(fake_data);
    const specific_data = _.pick(real_data, Object.keys(fake_data));

    Object.entries(specific_data).forEach(([key, value]) => {
      if (typeof value === 'object') {
        _.set(final_data, key, this._mergeRequestData(final_data[key], value))
      } else {
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
   * @param {object} real_data - specific request data
   * @returns {object} final_data - object in request body
   * @memberof Task
   */
  static _fakeBody(schema, real_data) {
    if (typeof schema !== 'object') return {};

    const fake_data = fake.sample(schema, {
      skipNonRequired: false, skipReadOnly: false, skiWriteOnly: false
    });

    const final_data = this._mergeRequestData(fake_data, real_data);

    return final_data;
  }

  /**
   *
   *
   * @static
   * @param {array} parameters
   * @param {object} real_data
   * @returns {object}
   * @memberof Task
   */
  static _fakeQuery(parameters, real_data) {
    if (Array.isArray(parameters) === false) return {};

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
   *
   *
   * @static
   * @param {string} api_name - api name
   * @param {array} path_parameters - swagger parameters about path
   * @param {object} context - context param in a flow, but it's priority lower than specific
   * @param {object} specific - specific param
   * @returns {string} api_url
   * @memberof Task
   */
  static _fakePath(api_name, path_parameters, real_data) {
    if (Array.isArray(path_parameters) === false) return {};

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
      return temp_url.replace(`:${key}`, value);
    }, api_name);

    return new_url;
  }

  /**
   *
   *
   * @param {object} context - context param in a flow, but it's priority lower than specific
   * @param {object} specific - specific param
   * @param {array} path_parameters - parameters of path
   * @memberof Task
   */
  async request() {
    const data = Task._fakeQuery(
      Swagger.getParametersSchema(this._operation_object),
      this._real_data
    );
    const query = Task._fakeBody(
      Swagger.getRequestBodySchema(this._operation_object),
      this._real_data
    );
    const url = Task._fakePath(
      this._api_name,
      this._path_parameters,
      this._real_data
    );

    const response = await httpRequest(url, this._method_type, {
      data,
      query
    })

    return {
      url, data, query, response
    };
  }
}

module.exports = Task;
