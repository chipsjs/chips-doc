const _ = require('lodash');

const { makeStruct } = require('./assist_macro');

// document: https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.2.md#oasObject
const OpenApiObject = makeStruct('openapi info servers paths security components tags');
const InfoObject = makeStruct('title description termsOfService version');
// const ServerObject = makeStruct('');
// const PathsObject = makeStruct('summary description get put post delete patch');

// const combining_key_map = {
//   anyof: 'anyOf',
//   oneof: 'oneOf',
//   not: 'not',
//   allof: 'allOf'
// };

const method_type_arr = [
  'get',
  'put',
  'post',
  'delete',
  'options',
  'head',
  'patch',
  'trace'
]

const key_map = {
  body: 'requestBody',
  query: 'parameters',
  response: 'responses'
};

const SwaggerDataType = {
  string: 'string',
  number: 'number',
  integer: 'integer',
  object: 'object',
  array: 'array',
  boolean: 'boolean',
  unknown: 'unknown'
};

class Swagger {
  static generateOpenApiObject(info_obj, path_items) {
    return new OpenApiObject('3.0.0', info_obj, [], path_items);
  }

  static packagePathItem(params) {
    const path_item = {};
    let map_key;

    Object.keys(params).forEach((key) => {
      if (params[key]) {
        map_key = key_map[key] || key;
        path_item[map_key] = params[key];
      } else if (key === 'response') {
        map_key = key_map[key] || key;
        _.setWith(path_item, [map_key, '200', 'description'], '', Object);
        _.setWith(path_item, [map_key, '200', 'content', 'application/json', 'schema'], {});
      }
    });

    return path_item;
  }

  /**
   *
   *
   * @static
   * @param {*} api_name
   * @returns
   * @memberof Swagger
   */
  static parseTag(api_name) {
    const arr = api_name.split('/');

    if (arr.length >= 2) {
      return new Array(arr[1]);
    }

    return null;
  }

  /**
   *
   *
   * @static
   * @param {*} json_schema
   * @param {*} type
   * @param {*} [options={}]
   * @returns
   * @memberof Swagger
   */
  static convertJsonSchema2Swagger(json_schema, type, options = {}) {
    if (typeof json_schema !== 'object') return null;
    if (Array.isArray(json_schema) && type !== 'path') return null;

    const { required_param_arr: required_params } = options;

    let convert_swagger = {};
    // TODO, header
    switch (type) {
      case 'body':
        _.set(convert_swagger, ['content', 'application/json', 'schema'], json_schema);

        if (Array.isArray(required_params) && required_params !== 0) {
          _.set(convert_swagger, ['content', 'application/json', 'schema', 'required'], required_params);
        }
        break;
      case 'query':
        convert_swagger = Object.entries(_.get(json_schema, 'properties')).map(([key, value]) => ({
          name: key,
          in: 'query',
          required: Array.isArray(required_params) && (required_params.includes(key)),
          schema: value
        }));
        break;
      case 'path':
        convert_swagger = json_schema.map((item) => ({
          name: item,
          in: 'path',
          required: true,
          schema: {
            type: 'string'
          }
        }));
        break;
      case 'response':
        _.setWith(convert_swagger, ['200', 'description'], '', Object);// empty, because api_spec dont have this description, we can add it in the future
        if (json_schema) {
          _.setWith(convert_swagger, ['200', 'content', 'application/json', 'schema'], json_schema, Object);
        } else {
          _.setWith(convert_swagger, ['200', 'content', 'application/json'], {}, Object);
        }
        break;
      default:
        break;
    }

    return convert_swagger;
  }

  /**
   *
   *
   * @static
   * @param {string} type - base data type in swagger
   * @param {string} description -
   * @param {object} [options] -
   * @param {object} [options.items] - type is 'array', you can specfic items
   * @param {object} [options.properties] - type is 'object', you can specfic properties
   * @memberof Swagger
   */
  static generateSchemaByType(type, description = '', options = {}) {
    switch (type) {
      case 'array':
        return {
          type,
          description,
          items: options.items || {}
        };
      case 'unknown':
        return {
          description
        }
      case 'object':
        return {
          type,
          description,
          properties: options.properties || {}
        }
      default: return {
        type,
        description
      };
    }
  }

  /**
   * generate info obj of swagger
   *
   * @static
   * @param {string} title
   * @param {string} description
   * @param {string} termsOfService
   * @param {string} version
   * @returns
   * @memberof Swagger
   */
  static generateInfoObject(title, description, termsOfService, version) {
    return new InfoObject(title, description, termsOfService, version);
  }

  static isCombiningSchemas(key) {
    const lower_case_key = key.toLowerCase();
    return ['allof', 'anyof', 'oneof', 'not'].includes(lower_case_key);
  }

  static hasMethodType(path_item, method_type) {
    return _.has(path_item, method_type);
  }

  static hasRequestBody(operation_object) {
    return _.has(operation_object, 'requestBody');
  }

  static hasResponses(operation_object) {
    return _.has(operation_object, 'responses');
  }

  static hasPath(operation_object) {
    if (!_.has(operation_object, 'parameters')) {
      return false;
    }

    const parameters = _.get(operation_object, 'parameters');
    for (let i = 0; i < parameters.length; i += 1) {
      if (parameters[i].in === 'path') {
        return true;
      }
    }

    return false;
  }

  static hasParameters(operation_object) {
    if (!_.has(operation_object, 'parameters')) {
      return false;
    }

    const parameters = _.get(operation_object, 'parameters');
    if (parameters.length === 0) return false;

    return true;
  }

  static getOperationObject(path_item, method_type) {
    return _.get(path_item, method_type);
  }

  static getOperationObjectFromSwagger(swagger, api_name, method_type) {
    return _.get(swagger, ['paths', api_name, method_type]);
  }

  static getResponseSchema(operation_object) {
    return _.get(operation_object, ['responses', '200', 'content', 'application/json', 'schema']);
  }

  static getRequestBodySchema(operation_object) {
    return _.get(operation_object, ['requestBody', 'content', 'application/json', 'schema']);
  }

  static getPathParameters(swagger, api_name) {
    return _.get(swagger, ['paths', api_name, 'parameters']);
  }

  static getParametersSchema(operation_object) {
    return _.get(operation_object, 'parameters');
  }

  static getParameterByNameAndType(parameters, name, type) {
    for (let i = 0; i < parameters.length; i += 1) {
      const parameter = parameters[i];
      if (parameter.in === type && parameter.name === name) {
        return parameter;
      }
    }

    return {};
  }

  static setOperationObject(path_item, method_type, operation_object) {
    return _.set(path_item, method_type, operation_object);
  }

  static setResponseSchema(operation_object, schema) {
    return _.set(operation_object, ['responses', '200', 'content', 'application/json', 'schema'], schema);
  }

  static setRequestBodySchema(operation_object, schema) {
    return _.set(operation_object, ['requestBody', 'content', 'application/json', 'schema'], schema);
  }

  static setPathSchema(parameters, name, schema) {
    return _.set(parameters, [name, 'schema'], schema);
  }

  static setParamerters(operation_object, parameters) {
    return _.set(operation_object, ['parameters'], parameters);
  }

  static addParameter(parameters, base_parameter, schema) {
    const new_parameter = _.cloneDeep(base_parameter);
    _.set(new_parameter, 'schema', schema);

    return parameters.push(new_parameter);
  }

  static loopMethodTypes(path_item, callback) {
    method_type_arr.forEach((method_type) => {
      if (path_item[method_type]) {
        callback(method_type, path_item[method_type]);
      }
    });
  }

  static initPathItemObject(path_items, api_name, base_path_item) {
    return _.set(path_items, api_name, _.cloneDeep(base_path_item));
  }

  // static getCominingKeyName(key) {
  //   const lower_case_key = key.toLowerCase();
  //   return combining_key_map(lower_case_key);
  // }

  // static convertSwagger2JsonSchema(paths) {
  //   Object.entries(paths).reduce(path_item) => {
  //   };
  // }
}

Swagger.dataType = SwaggerDataType;

module.exports = Swagger;

