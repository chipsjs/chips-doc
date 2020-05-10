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
        path_item[key] = params[map_key];
      }
    });

    return path_item;
  }

  static convertJsonSchema2Swagger(json_schema, type, options = {}) {
    let convert_swagger;

    // TODO, header
    switch (type) {
      case 'body':
        _.set(convert_swagger, ['content', 'schema'], json_schema);

        if (Array.isArray(options.required_param_arr) && options.required_param_arr.length !== 0) {
          _.set(convert_swagger, ['required'], options.required_param_arr);
        }
        break;
      case 'query':
        convert_swagger = Object.entries(json_schema).map(([key, value]) => ({
          name: key,
          in: 'query',
          require: Array.isArray(options.required_param_arr) && (options.required_param_arr.indexOf(key) !== -1),
          schema: value
        }));
        break;
      case 'path':
        break;
      case 'response':
        if (json_schema) {
          _.set(convert_swagger, ['200', 'description'], '');// empty, because api_spec dont have this description, we can add it in the future
          _.set(convert_swagger, ['200', 'content', 'application/json', 'schema'], json_schema);
        } else {
          _.set(convert_swagger, ['200', 'content', 'application/json'], {});
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

