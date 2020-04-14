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
   *
   * @param {string} description -
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

    if (prefix_type === 'number' || lower_case_description.indexOf('number:') !== -1) {
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
   * @return {object} value
   * @return {object} value.convert_schema - {
   *    pin: {descriptions: 'the pin for this user', type: 'string' },
   *    slot: {descriptions: 'the slot for user', type: 'number' }
   * }
   * @return {array} value.required_param_arr -  ['pin', 'slot']
   */
  _parseDetailSchema(schema) {
    const convert_schema = {};

    const param_arr = Object.keys(schema).map((param_name) => {
      if (typeof schema[param_name] === 'string') {
        convert_schema[param_name] = {
          description: schema[param_name],
          type: this._parseType(schema[param_name])
        };
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

      return param_name;
    });

    return { convert_schema, param_arr }
  }

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
      const { convert_schema, param_arr } = this._parseDetailSchema(spec_query.required);
      Object.assign(convert_query.properties, convert_schema);
      convert_required_param_arr = param_arr;
      delete spec_query.required;
    }

    if (spec_query.optional) {
      const { convert_schema } = this._parseDetailSchema(spec_query.optional);
      Object.assign(convert_query.properties, convert_schema);
      delete spec_query.optional;
    }

    if (spec_query.headers) {
      // do nothing
      delete spec_query.headers;
    }

    const { convert_schema } = this._parseDetailSchema(spec_query);
    Object.assign(convert_query.properties, convert_schema);

    convert_query.required = convert_required_param_arr;

    return convert_query;
  }

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

  parseResponseSchema(spec_response) {
    const convert_response = {};

    if (spec_response.body) {
      convert_response.success = this.parseQueryOrBodySchema(spec_response.body);
    }

    return convert_response;
  }

  // success fail
  run(old_format_doc, spec_output_path) {
    const new_format_doc = {};
    let current_api_name = {};

    try {
      Object.keys(old_format_doc).forEach((api_name) => {
        current_api_name = api_name;
        const api = old_format_doc[api_name];
        new_format_doc[api_name] = {
          method_type: api.method || api.method_type
        };
        delete api.method;
        Object.assign(new_format_doc[api_name], api);
        new_format_doc[api_name].request = this.parseRequestSchema(api.request);
        new_format_doc[api_name].response = this.parseResponseSchema(api.response);
      });
    } catch (err) {
      throw new TypeError(`SpecConvert::run: ${current_api_name} fail!!!`);
    }

    const output_path = `${spec_output_path}_api_doc.json`;
    fs.writeFileSync(output_path, JSON.stringify(new_format_doc, null, 4));

    return new_format_doc;
  }
}

module.exports = SpecConvert;
