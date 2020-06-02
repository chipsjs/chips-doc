const fs = require('fs');
const _ = require('lodash');
const config = require('config');

const Base = require('../../lib/base_class');
const { Swagger, SwaggerDataType } = require('../../lib/swagger_convert');

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
      return SwaggerDataType.string;
    }

    if (prefix_type === 'number' || lower_case_description.indexOf('number:') !== -1) {
      return SwaggerDataType.number;
    }

    // A tricky way for match integer && <integer> &&
    // other cases when first ten characters have 'integer'
    if (lower_case_description === 'int' || lower_case_description.substr(0, 10).indexOf('integer') !== -1) {
      return SwaggerDataType.integer;
    }

    if (prefix_type === 'object') {
      return SwaggerDataType.object;
    }

    if (lower_case_description.substr(0, 5) === 'array') {
      return SwaggerDataType.array;
    }

    // A tricky way for match boolean && <boolean> &&
    // other cases when first ten characters have 'boolean'
    if (lower_case_description.substr(0, 10).indexOf('boolean') !== -1) {
      return SwaggerDataType.boolean;
    }

    return SwaggerDataType.unknown;
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
    let convert_schema = {};
    let prev_param_name;
    const required_param_set = Object.keys(schema).reduce((result, param_name) => {
      if (param_name === '...') return result;

      // param_name is userid2, prev_param_name is userid, param name will ignore
      if (param_name.indexOf(prev_param_name) === 0) {
        const different_string_part = param_name.substring(prev_param_name.length)
        const different_number_part = Number.parseInt(different_string_part, 10);
        if (!Number.isNaN(different_number_part) || different_string_part === 'N') {
          return result;
        }
      }

      const parameter_object = schema[param_name];
      if (!parameter_object) {
        convert_schema[param_name] = Swagger.generateSchemaByType(SwaggerDataType.unknown);
      } else {
        switch (typeof parameter_object) {
          case 'string':
            convert_schema[param_name] = Swagger.generateSchemaByType(
              this._parseType(parameter_object),
              parameter_object
            );
            if (!isRequired && parameter_object.indexOf('required') !== -1) {
              result.add(param_name);
            }
            break;
          case 'object':
            if (Swagger.isCombiningSchemas(param_name) || param_name === 'ifPresent' || param_name === 'optional' || param_name === 'header') {
              const child_convert_schema = this._parseDetailSchema(parameter_object, false);
              convert_schema = child_convert_schema.convert_schema;
              child_convert_schema.param_arr.forEach((item) => result.add(item));
              break;
            }

            if (param_name === 'required') {
              const child_convert_schema = this._parseDetailSchema(parameter_object, true);
              convert_schema = child_convert_schema.convert_schema;
              child_convert_schema.param_arr.forEach((item) => result.add(item));
              break;
            }

            if (Array.isArray(parameter_object)) {
              // default spec format is as the same as api_spec['3.0,0'].xxx.events
              if (parameter_object.length === 0) {
                convert_schema[param_name] = Swagger.generateSchemaByType(SwaggerDataType.array);
              } else {
                const temp_type = typeof parameter_object[0];
                if (temp_type === 'object') {
                  // default spec format is as the same as api_spec['3.0,0'].xxx.events
                  const convert_child_schema = this._parseDetailSchema(parameter_object[0]);
                  const items = Swagger.generateSchemaByType(SwaggerDataType.object, '', {
                    properties: convert_child_schema.convert_schema
                  });
                  convert_schema[param_name] = Swagger.generateSchemaByType(SwaggerDataType.array, '', { items });
                } else if (temp_type === 'string') {
                  // such as locks: ['lockid1', 'lockid2']
                  convert_schema[param_name] = Swagger.generateSchemaByType('array', parameter_object[0])
                }
              }
            } else {
              const convert_child_schema = this._parseDetailSchema(parameter_object);
              if (Object.keys(convert_child_schema) === 0) {
                convert_schema[param_name] = Swagger.generateSchemaByType(SwaggerDataType.object, '');
              } else {
                convert_schema[param_name] = Swagger.generateSchemaByType(SwaggerDataType.object, '', {
                  properties: convert_child_schema.convert_schema
                });
              }
            }
            break;
          case 'function': // super special schema, like spec[3.0.0].xxx.nextPage
            convert_schema[param_name] = Swagger.generateSchemaByType(this._parseType(schema[param_name].name, ''));
            break;
          default:
            convert_schema[param_name] = Swagger.generateSchemaByType(SwaggerDataType.unknown, '');
            break;
        }
      }

      if (isRequired) {
        result.add(param_name);
      }
      prev_param_name = param_name;

      return result;
    }, new Set());

    const param_arr = Array.from(required_param_set);
    return { convert_schema, param_arr }
  }

  /**
   * spec api_name is 'GET /test/:id/' and real_api_name is '/test/:id/'
   *
   * @param {string} api_name
   * @returns {string} - real_api_name
   * @memberof SpecConvert
   */
  _getRealApiName(api_name) {
    const index = api_name.lastIndexOf(' ');
    if (index !== -1) {
      return api_name.substring(index + 1);
    }

    return api_name;
  }

  /**
   * correct method type and warn when is not excepted_method_type
   *
   * @param {string} api_name - eg: 'GET /test/:id/'
   * @param {string} excepted_method_type -
   * excepted method type, it is from method or methodtype property of spec
   * @returns
   * @memberof SpecConvert
   */
  _getRealMethodType(api_name, excepted_method_type = '') {
    let real_method_type = excepted_method_type;
    const index = api_name.indexOf(' ');
    if (index !== -1) {
      real_method_type = api_name.substring(0, index).toLowerCase();
      if ((excepted_method_type !== real_method_type) && (excepted_method_type !== '')) {
        this.logger().warn(`SpecConvert:: ${api_name} spec warn! method type is ${excepted_method_type}, real method type is ${real_method_type}`);
      }
    }

    return real_method_type;
  }

  /**
   * parse old_format_doc[api_name].request.body
   * @param {object} spec_schema - old_format_doc[api_name].request.body
   * @return {object} convert_query - api_doc[api_name].request.body
   */
  _parseSpecSchema(spec_schema) {
    // filter spec_schema is string
    if (typeof spec_schema !== 'object') return {};
    let required_param_arr = [];

    if (Array.isArray(spec_schema)) {
      const new_schema = {
        type: 'array',
        items: {}
      };
      if (spec_schema.length !== 0) {
        new_schema.items = {
          type: 'object',
          properties: this._parseDetailSchema(spec_schema[0]).convert_schema || {}
        };
      }

      return { new_schema, required_param_arr };
    }

    const new_schema = {
      type: 'object',
      properties: {}
    };

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
    if (typeof spec_schema !== 'object' || Object.keys(spec_schema).length === 0) return null;

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

  convertSpec2Swagger(spec_doc) {
    const path_items = {};
    let current_api_name = '';

    try {
      Object.keys(spec_doc).forEach((api_name) => {
        current_api_name = api_name;
        const api = spec_doc[api_name];
        const real_api_name = this._getRealApiName(api_name);
        const real_method_type = this._getRealMethodType(
          api_name,
          (api.method || api.method_type).toLowerCase()
        );

        if (!_.get(path_items, [real_api_name, 'parameters'])) {
          const parameters = this.parsePathSchema(real_api_name);
          if (parameters.length !== 0) {
            _.set(path_items, [real_api_name, 'parameters'], parameters);
          }
        }
        _.set(path_items, [real_api_name, real_method_type], Swagger.packagePathItem({
          summary: api.summary,
          description: api.note,
          tags: Swagger.parseTag(real_api_name),
          body: this.parseRequestBodySchema(_.get(api, ['request', 'body'])),
          query: this.parseQuerySchema(_.get(api, ['request', 'query'])),
          response: this.parseResponseSchema(_.get(api, ['response', 'body'])),
        }));
      });
    } catch (err) {
      throw new TypeError(`SpecConvert::run: ${current_api_name} fail!err_msg: ${err.message}`);
    }

    return path_items;
  }

  /**
   * convert api spec to api doc json, overwrite
   * @param {object} spec_dpc - key is api name,
   * value is detail info
   * @param {string} spec_output_path - output path
   * @param {string} api_version - api version
   * @return {object} new_format_doc - return api_doc_json, key is api name,
   * value is detail info follow the api doc, such as
  */
  run(spec_doc, spec_output_path, api_version) {
    const path_items = this.convertSpec2Swagger(spec_doc);
    const info_obj = Swagger.generateInfoObject('august-rest-api', 'If you want to refresh swagger, click terms of service and refersh the browser', config.get('terms_of_service'), api_version);
    const swagger = Swagger.generateOpenApiObject(info_obj, path_items);
    fs.writeFileSync(`${spec_output_path}.json`, JSON.stringify(swagger, null, 2));

    return path_items;
  }

  readSwaggerJson(spec_output_path) {
    const content = fs.readFileSync(`${spec_output_path}.json`, 'utf8');
    return JSON.parse(content);
  }

  /**
   * request body or response body, please note this function will change base_schema
   *
   * @param {object} base_schema
   * @param {object} extention_schema
   * @returns {object} new_schema
   * @memberof SpecConvert
   */
  _mergeJsonSchema(base_schema, extention_schema) {
    // if obj is undefined, use the other obj
    if (!(base_schema && extention_schema)) {
      return base_schema || extention_schema;
    }

    // if type is undefined, extention_schema is all addtional property for spec
    if (typeof base_schema.type === 'undefined') {
      const new_schema = _.cloneDeep(extention_schema);
      return _.merge(new_schema, base_schema);
    }

    // if type is different, use base_obj
    if (base_schema.type !== extention_schema.type) {
      return base_schema;
    }

    const new_schema = _.cloneDeep(extention_schema);
    _.merge(new_schema, base_schema);

    // if type is object, continue to recursive
    // if type is array, items which convert from spec are inaccurate, use extention_obj to supple
    if (base_schema.type === SwaggerDataType.object) {
      new_schema.properties = Object.entries(base_schema.properties).reduce(
        (result, [key, value]) => {
          const sub_schema = this._mergeJsonSchema(value, _.get(extention_schema, ['properties', key]));
          _.set(result, key, sub_schema);

          return result;
        }, {}
      );
    }
    // special case for description is null
    if (new_schema.description === '' && typeof extention_schema.description === 'string') {
      new_schema.description = extention_schema.description;
    }

    return new_schema;
  }

  _mergeParameters(base_parameters, extention_parameters) {
    let new_parameters = [];

    if (extention_parameters) {
      base_parameters.forEach((base_parameter) => {
        const extention_parameter = Swagger.getParameterByNameAndType(
          extention_parameters,
          base_parameter.name,
          base_parameter.in
        );

        if (_.has(extention_parameter, 'schema')) {
          Swagger.addParameter(
            new_parameters,
            base_parameter,
            this._mergeJsonSchema(base_parameter.schema, extention_parameter.schema)
          )
        } else {
          new_parameters.push(base_parameter);
        }
      });
    } else {
      new_parameters = base_parameters;
    }

    return new_parameters;
  }

  /**
   * merge extention_object to base_operation_object
   * operation_object is https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.3.md#operationObject
   *
   * @param {object} base_operation_object
   * @param {object} extention_object - it may have four kinds of key: path, query, response, body
   *  path value's format is json schema and other type is swagger operation object format
   * @returns {object} new_operation_object
   * @memberof SpecConvert
   */
  _mergePathItem(base_operation_object, extention_object) {
    const new_operation_object = _.cloneDeep(base_operation_object);

    if (Swagger.hasRequestBody(base_operation_object)) {
      const base_schema = Swagger.getRequestBodySchema(base_operation_object);
      const extention_schema = Swagger.getRequestBodySchema(extention_object)

      Swagger.setRequestBodySchema(
        new_operation_object,
        this._mergeJsonSchema(base_schema, extention_schema)
      );
    }

    // responses must have
    if (Swagger.hasResponses(base_operation_object)) {
      const base_schema = Swagger.getResponseSchema(base_operation_object);
      const extention_schema = Swagger.getResponseSchema(extention_object)

      Swagger.setResponseSchema(
        new_operation_object,
        this._mergeJsonSchema(base_schema, extention_schema)
      );
    } else {
      this.logger().warn('SpecConvert:: _mergePathItem warn! responses no exists');
    }

    if (Swagger.hasParameters(base_operation_object)) {
      const base_schema = Swagger.getParametersSchema(base_operation_object);
      const extention_schema = Swagger.getParametersSchema(extention_object)

      Swagger.setParamerters(
        new_operation_object,
        this._mergeParameters(base_schema, extention_schema)
      );
    }

    return new_operation_object;
  }

  /**
   * used as sync swagger when spec updated
   *
   * @param {object} lastest_spec_doc - base spec doc
   * @param {string} extention_path_items - the depedence extention path items of swagger
   * @param {string} output_swagger_path - output path of new version swagger
   * @param {string} api_version - api version
   * @returns {object} new_version_swagger
   * @memberof SpecConvert
   */
  syncSwaggerJson(lastest_spec_doc, extention_path_items, api_version = '0.0.0') {
    const base_path_items = this.convertSpec2Swagger(lastest_spec_doc);

    const new_path_items = Object.entries(base_path_items).reduce(
      (result, [api_name, base_path_item]) => {
        Swagger.initPathItemObject(result, api_name, base_path_item);

        // path is special, just have schema
        if (Swagger.hasPath(result[api_name])) {
          Swagger.setParamerters(
            result[api_name],
            this._mergeParameters(
              result[api_name].parameters,
              _.get(extention_path_items, [api_name, 'parameters'])
            )
          );
        }

        Swagger.loopMethodTypes(base_path_item, (method_type, base_operation_object) => {
          if (Swagger.hasMethodType(extention_path_items[api_name], method_type)) {
            const extention_operation_object = Swagger.getOperationObject(
              extention_path_items[api_name], method_type
            );

            const new_operation_object = this._mergePathItem(
              base_operation_object, extention_operation_object
            );
            Swagger.setOperationObject(result[api_name], method_type, new_operation_object);
          } else {
            Swagger.setOperationObject(result[api_name], method_type, base_operation_object);
          }
        });

        return result;
      }, {}
    );

    const info_obj = Swagger.generateInfoObject('august-rest-api', 'If you want to refresh swagger, click terms of service and refersh the browser', config.get('terms_of_service'), api_version);
    const new_version_swagger = Swagger.generateOpenApiObject(info_obj, new_path_items);
    return new_version_swagger;
  }

  outputNewSwagger(new_version_swagger, output_swagger_path) {
    fs.writeFileSync(`${output_swagger_path}.json`, JSON.stringify(new_version_swagger, null, 2));
  }
}

module.exports = SpecConvert;
