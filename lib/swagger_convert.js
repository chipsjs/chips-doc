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
      return arr[1];
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

    let convert_swagger = {};
    // TODO, header
    switch (type) {
      case 'body':
        _.set(convert_swagger, ['content', 'application/json', 'schema'], json_schema);

        if (Array.isArray(options.required_param_arr) && options.required_param_arr.length !== 0) {
          _.set(convert_swagger, ['content', 'application/json', 'schema', 'required'], options.required_param_arr);
        }
        break;
      case 'query':
        convert_swagger = Object.entries(_.get(json_schema, 'properties')).map(([key, value]) => ({
          name: key,
          in: 'query',
          required: Array.isArray(options.required_param_arr) && (options.required_param_arr.includes(key)),
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

  // static getCominingKeyName(key) {
  //   const lower_case_key = key.toLowerCase();
  //   return combining_key_map(lower_case_key);
  // }

  static convertSwagger2JsonSchema() {
    // TODO
  }
}

module.exports = { Swagger, SwaggerDataType };

