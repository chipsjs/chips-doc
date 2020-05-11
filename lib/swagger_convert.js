const _ = require('lodash');

const { makeStruct } = require('./assist_macro');

// document: https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.2.md#oasObject
const OpenApiObject = makeStruct('openapi info servers paths security components tags');
const InfoObject = makeStruct('title description termsOfService version');
// const ServerObject = makeStruct('');
// const PathsObject = makeStruct('summary description get put post delete patch');

const key_map = {
  body: 'requestBody',
  query: 'parameters',
  response: 'responses'
};

class Swagger {
  static packageItems(info_obj, items) {
    return new OpenApiObject('3.0.0', info_obj, [], items);
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

  static convertJsonSchema2Swagger(json_schema, type, options = {}) {
    // TODO, default object, need check
    let convert_swagger = {};

    // TODO, header
    switch (type) {
      case 'body':
        // to optimize
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
          // const value = Array.isArray(json_schema) ? json_schema : json_schema.properties;
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

  static convertSwagger2JsonSchema() {
    // TODO
  }
}

module.exports = { Swagger, InfoObject };

