const fs = require('fs');

const Base = require('../../lib/base_class');

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
    if (typeof description !== 'string') {
      return 'unknown';
    }

    const lower_case_description = description.toLowerCase();
    const prefix_type = lower_case_description.substr(0, 6);

    // there are two different schema: 1.[optional] string: or 2.String/string
    if (prefix_type === 'string' || lower_case_description.indexOf('string:') !== -1) {
      return 'string';
    }

    if (prefix_type === 'number' || lower_case_description.indexOf('number:') !== -1 || lower_case_description === 'int') {
      return 'number'
    }

    if (prefix_type === 'object') {
      return 'object';
    }

    if (lower_case_description.substr(0, 5) === 'array') {
      return 'array'
    }

    if (lower_case_description.substr(0, 7) === 'boolean') {
      return 'boolean'
    }

    return 'unknown';
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

      if (typeof schema[param_name] === 'string') {
        convert_schema[param_name] = {
          description: schema[param_name],
          type: this._parseType(schema[param_name])
        };
        if (!isRequired && schema[param_name].indexOf('[required]') !== -1) {
          result.push(param_name);
        }
      } else if (schema[param_name] && typeof schema[param_name] === 'object') {
        const convert_child_schema = this._parseDetailSchema(schema[param_name]);
        convert_schema[param_name] = {
          type: 'object',
          properties: convert_child_schema.convert_schema
        };
      } else {
        convert_schema[param_name] = {
          description: 'unknown',
          type: 'unknown'
        };
      }

      if (isRequired) {
        result.push(param_name);
      }
      return result;
    }, []);

    return { convert_schema, param_arr }
  }

  /**
   * parse old_format_doc[api_name].request.body || old_format_doc[api_name].request.query
   * @param {object} spec_query - old_format_doc[api_name].request.body || query
   * @return {object} convert_query - api_doc[api_name].request.body || query
   */
  parseQueryOrBodySchema(spec_query) {
    // filter spec_query is string
    if (typeof spec_query !== 'object') return {};

    const convert_query = {
      type: 'object',
      properties: {}
    };
    let convert_required_param_arr = [];

    // there are two different schema in api_spec, such as query.required.pin or query.pin
    if (spec_query.required) {
      const { convert_schema, param_arr } = this._parseDetailSchema(spec_query.required, true);
      Object.assign(convert_query.properties, convert_schema);
      convert_required_param_arr = param_arr;
    }

    if (spec_query.optional) {
      const { convert_schema } = this._parseDetailSchema(spec_query.optional);
      Object.assign(convert_query.properties, convert_schema);
    }

    if (spec_query.headers) {
      // do nothing
    }

    const { convert_schema, param_arr } = this._parseDetailSchema(spec_query);
    Object.assign(convert_query.properties, convert_schema);

    convert_query.required = convert_required_param_arr.concat(param_arr);

    return convert_query;
  }

  /**
   * parse old_format_doc[api_name].request
   * @param {object} spec_request - api_spec[api_name].request
   * @return {object} convert_request - api_doc[api_name].request
   */
  parseRequestSchema(spec_request) {
    const convert_request = {};

    if (spec_request.query) {
      convert_request.query = this.parseQueryOrBodySchema(spec_request.query);
    }

    if (spec_request.body) {
      convert_request.body = this.parseQueryOrBodySchema(spec_request.body);
    }

    return convert_request;
  }

  /**
   * parse old_format_doc[api_name].response
   * @param {object} spec_response - api_spec[api_name].response
   * @return {object} convert_response - api_doc[api_name].response
   */
  parseResponseSchema(spec_response) {
    const convert_response = {};

    if (spec_response.body) {
      convert_response.success = this.parseQueryOrBodySchema(spec_response.body);
    }

    return convert_response;
  }

  /**
   * convert api spec to api doc json
   * @param {object} old_format_doc - key is api name,
   * value is detail info, such as
   * {
        summary: 'check account exist',
        method: 'get',
        request: {
          query: {
            email: '[optional] string: user email',
            phone: '[required] string: user phone number,standard format is E164'
          }
        },
        response: {
          body: {
            exists: 'boolean',
            msg: 'string: detail message'
          },
        },
      }
   * @param {string} spec_output_path - output path
   * @return {object} new_format_doc - return api_doc_json, key is api name,
   * value is detail info follow the api doc, such as
   * {
      "method_type": "get",
      "summary": "check email or phone for duplicates",
      "request": {
        "query": {
          "type": "object",
          "properties": {
            "email": {
              "description": "[optional] string: user email",
              "type": "string"
            },
            "phone": {
              "description": "[required] string: user phone number,standard format is E164",
              "type": "string"
            }
          },
          "required": [
            "phone"
          ]
      }
    },
    "response": {
      "success": {
        "type": "object",
        "properties": {
          "exists": {
            "description": "boolean",
            "type": "boolean"
          },
          "msg": {
            "description": "string: detail message",
            "type": "string"
          }
        },
        "required": []
      }
    }
  */
  run(old_format_doc, spec_output_path) {
    const new_format_doc = {};
    let current_api_name = {};

    try {
      Object.keys(old_format_doc).forEach((api_name) => {
        new_format_doc[api_name] = {};
        current_api_name = api_name;
        const api = old_format_doc[api_name];
        Object.assign(new_format_doc[api_name], api);

        const method_type = api.method || api.method_type;
        new_format_doc[api_name].method_type = method_type.toLowerCase()
        delete new_format_doc[api_name].method;

        new_format_doc[api_name].request = this.parseRequestSchema(api.request);
        new_format_doc[api_name].response = this.parseResponseSchema(api.response);
      });
    } catch (err) {
      throw new TypeError(`SpecConvert::run: ${current_api_name} fail!!!`);
    }

    const output_path = `${spec_output_path}_api_doc.json`;
    fs.writeFileSync(output_path, JSON.stringify(new_format_doc, null, 2));

    return new_format_doc;
  }
}

module.exports = SpecConvert;
