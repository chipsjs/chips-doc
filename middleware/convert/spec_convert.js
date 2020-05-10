const fs = require('fs');
const _ = require('lodash');

const Base = require('../../lib/base_class');
const { Swagger, InfoObject } = require('../../lib/swagger_convert');

class SpecConvert extends Base.factory() {
  static initialize({ log_module }) {
    this.loadInstance({
      read_only_properties: {
        logger: log_module || console
      }
    });
  }

  /**
   * parse description to get data type
   *
   * @param {string} description - '[optional] string: user email'
   * @return {string} type - string | number | object | array | boolean | unknown
   */
  _parseType(description) {
    const lower_case_description = description.toLowerCase();
    const prefix_type = lower_case_description.substr(0, 6);

    // there are two different schema: 1.[optional] string: or 2.String/string
    if (prefix_type === 'string' || lower_case_description.indexOf('string:') !== -1) {
      return 'string';
    }

    if (prefix_type === 'number' || lower_case_description.indexOf('number:') !== -1) {
      return 'number';
    }

    if (lower_case_description === 'int') {
      return 'integer';
    }

    if (prefix_type === 'object') {
      return 'object';
    }

    if (lower_case_description.substr(0, 5) === 'array') {
      return 'array';
    }

    // A tricky way for match boolean && <boolean> &&
    // other cases when first ten characters have 'boolean'
    if (lower_case_description.substr(0, 10).indexOf('boolean') !== -1) {
      return 'boolean'
    }

    return 'string';// to temp
  }

  /**
   *
   * @param {object} schema - {pin: 'the pin for this user', slot: 'the slot for user'}
   * @param {boolean} isRequired - when is true, all params in shcema is required
   * @return {object} value
   * @return {object} value.convert_schema - {
   *    pin: {descriptions: 'the pin for this user', type: 'string' },
   *    slot: {descriptions: 'the slot for user', type: 'number' }
   * }
   * @return {array} value.required_param_arr -  ['pin', 'slot']
   */
  _parseDetailSchema(schema, isRequired = false) {
    const convert_schema = {};
    const param_arr = Object.keys(schema).reduce((result, param_name) => {
      if (param_name === 'required' || param_name === 'optional' || param_name === 'header') return result;
      if (schema[param_name]) {
        switch (typeof schema[param_name]) {
          case 'string':
            convert_schema[param_name] = {
              description: schema[param_name],
              type: this._parseType(schema[param_name])
            };
            if (!isRequired && schema[param_name].indexOf('required') !== -1) {
              result.push(param_name);
            }
            break;
          case 'object':
            if (Array.isArray(schema[param_name])) {
              // default spec format is as the same as api_spec['3.0,0'].xxx.events
              if (schema[param_name].length === 0) {
                convert_schema[param_name] = {
                  type: 'array',
                  items: {
                    type: 'unknown'
                  }
                }
              } else {
                const convert_child_schema = this._parseDetailSchema(schema[param_name][0]);
                convert_schema[param_name] = {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: convert_child_schema.convert_schema
                  }
                };
              }
            } else {
              const convert_child_schema = this._parseDetailSchema(schema[param_name]);
              convert_schema[param_name] = {
                type: 'object',
                properties: convert_child_schema.convert_schema
              };
            }
            break;
          case 'function': // super special schema, like spec[3.0.0].xxx.nextPage
            convert_schema[param_name] = {
              description: '',
              type: this._parseType(schema[param_name].name)
            };
            break;
          default:
            convert_schema[param_name] = {
              description: 'unknown',
              type: 'unknown'
            };
            break;
        }
      }

      if (isRequired) {
        result.push(param_name);
      }
      return result;
    }, []);

    return { convert_schema, param_arr }
  }

  /**
   * parse old_format_doc[api_name].request.body
   * @param {object} spec_schema - old_format_doc[api_name].request.body
   * @return {object} convert_query - api_doc[api_name].request.body
   */
  _parseSpecSchema(spec_schema) {
    // filter spec_query is string
    if (typeof spec_schema !== 'object') return {};
    let required_param_arr = [];

    if (Array.isArray(spec_schema)) {
      const new_schema = {
        type: 'array',
      };
      if (spec_schema.length === 0) {
        new_schema.items = {
          type: 'unknown'
        }
      } else {
        const { convert_schema: new_detail_schema } = this._parseDetailSchema(spec_schema[0]);
        new_schema.items = {
          type: 'object',
          properties: new_detail_schema
        };
      }

      return { new_schema, required_param_arr };
    }

    const new_schema = {
      type: 'object',
      properties: {}
    };

    // there are two different schema in api_spec, such as query.required.pin or query.pin
    if (spec_schema.required) {
      const { convert_schema: new_detail_schema, param_arr } = this._parseDetailSchema(spec_schema.required, true);
      Object.assign(new_schema.properties, new_detail_schema);
      required_param_arr = param_arr;
    }

    if (spec_schema.optional) {
      const { convert_schema: new_detail_schema } = this._parseDetailSchema(spec_schema.optional);
      Object.assign(new_schema.properties, new_detail_schema);
    }

    if (spec_schema.headers) {
      // TODO
    }

    const { convert_schema: new_detail_schema, param_arr } = this._parseDetailSchema(spec_schema);
    Object.assign(new_schema.properties, new_detail_schema);
    required_param_arr = required_param_arr.concat(param_arr)

    return { new_schema, required_param_arr };
  }

  /**
   * parse old_format_doc[api_name].request.body
   * @param {object} spec_schema - api_spec[api_name].request.body
   * @return {object} convert_request - api_doc[api_name].request
   */
  parseRequestBodySchema(spec_schema) {
    if (!spec_schema) return null;

    const { new_schema, required_param_arr } = this._parseSpecSchema(spec_schema);
    return Swagger.convertJsonSchema2Swagger(new_schema, 'body', { required_param_arr })
  }

  /**
   * parse old_format_doc[api_name].request.query
   * @param {object} request - api_spec[api_name].request.body
   * @return {object} convert_request - api_doc[api_name].request
   */
  parseQuerySchema(spec_schema) {
    if (!spec_schema) return null;

    const { new_schema, required_param_arr } = this._parseSpecSchema(spec_schema);
    return Swagger.convertJsonSchema2Swagger(new_schema, 'query', { required_param_arr });
  }

  /**
   * parse old_format_doc[api_name].response
   * @param {object} spec_schema - api_spec[api_name].response
   * @return {object} convert_response - api_doc[api_name].response
   */
  parseResponseSchema(spec_schema) {
    if (!spec_schema) return null;

    const { new_schema } = this._parseSpecSchema(spec_schema);
    return Swagger.convertJsonSchema2Swagger(new_schema, 'response');
  }

  /**
   * parse path
   * @param {object} real_api_name - real_api_name
   * @return {object} convert_schema -
   */
  parsePathSchema(real_api_name) {
    if (!real_api_name) return null;

    const path_items = real_api_name.split('/');
    const new_schema = path_items.reduce((result, item) => {
      if (_.get(item, ['0']) === ':') {
        result.push(item.substr(1));
      }
      return result;
    }, []);
    return Swagger.convertJsonSchema2Swagger(new_schema, 'path');
  }

  /**
   * convert api spec to api doc json
   * @param {object} old_format_doc - key is api name,
   * value is detail info
   * @param {string} spec_output_path - output path
   * @return {object} new_format_doc - return api_doc_json, key is api name,
   * value is detail info follow the api doc, such as
  */
  run(old_format_doc, spec_output_path) {
    const path_items = {};
    let current_api_name = '';

    try {
      Object.keys(old_format_doc).forEach((api_name) => {
        current_api_name = api_name;
        const index = api_name.lastIndexOf(' ');
        if (index === -1) {
          throw new TypeError('api_name is not supported');
        }
        // api_name is 'GET /test/:id/' and real_api_name is '/test/:id/'
        const real_api_name = api_name.substring(index + 1);
        const api = old_format_doc[api_name];
        const method_type = (api.method || api.method_type).toLowerCase();

        _.set(path_items, [real_api_name, method_type], Swagger.packagePathItem({
          summary: api.summary,
          description: api.note,
          body: this.parseRequestBodySchema(_.get(api, ['request', 'body'])),
          query: this.parseQuerySchema(_.get(api, ['request', 'query'])),
          response: this.parseResponseSchema(_.get(api, ['response', 'body'])),
        }));

        // to optimize
        _.set(path_items, [real_api_name, 'parameters'], this.parsePathSchema(real_api_name));
      });
    } catch (err) {
      throw new TypeError(`SpecConvert::run: ${current_api_name} fail!err_msg: ${err.message}`);
    }

    const info_obj = new InfoObject('august-rest-api', 'august api server for mobile', '{base_url}', '8.8.0');
    const openapi_obj = Swagger.packageItems(info_obj, path_items);
    const output_path = `${spec_output_path}_api_doc.json`;
    fs.writeFileSync(output_path, JSON.stringify(openapi_obj, null, 2));

    return path_items;
  }
}

module.exports = SpecConvert;
