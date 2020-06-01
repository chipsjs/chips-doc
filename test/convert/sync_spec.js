const { assert } = require('chai');
const _ = require('lodash');

const base_spec = require('./base_spec.json');
const extention_swagger = require('./swagger_extention');
const Convert = require('../../middleware/convert/spec_convert');
const { Swagger } = require('../../lib/swagger_convert');

/**
 * used to mock a spec
 *
 * @param {string} api_name
 * @returns
 */
const generateSpec = (api_name) => {
  const json = base_spec[api_name];
  const spec = _.set({}, api_name, json);
  return spec;
};

const generateSwagger = (api_name) => {
  if (!api_name) return {};

  const json = extention_swagger[api_name];
  const spec = _.set({}, api_name, json);
  return spec;
};

describe('sync swagger from new spec and extention swagger', () => {
  let operation_object;
  let swagger;

  before('init convert task', () => {
    Convert.initialize({ log_module: console });
  })

  describe('api name changed', () => {
    describe('api name created', () => {
      before('run', () => {
        const spec = generateSpec('GET /newApi');
        swagger = Convert.getInstance().syncSwaggerJson(spec, generateSwagger());
        operation_object = Swagger.getOperationObjectFromSwagger(swagger, '/newApi', 'get');
      });

      it('should be have correct swagger', () => {
        const response_schma = Swagger.getResponseSchema(operation_object);
        assert.strictEqual(Object.keys(response_schma.properties).length, 1);
        assert.nestedPropertyVal(response_schma, 'properties.a.type', 'string');
        assert.nestedPropertyVal(response_schma, 'properties.a.description', 'string: a');
      });
    });

    describe('api name is deleted and no this name in spec', () => {
      before('run', () => {
        const spec = generateSpec('GET /newApi');
        swagger = Convert.getInstance().syncSwaggerJson(spec, generateSwagger('/deleted'));
      });

      it('should be have correct swagger', () => {
        assert.notNestedProperty(swagger, 'paths./deleted'); // this api name is defined in swagger_extention.json
      });
    });

    describe('api name updated', () => {
      before('run', () => {
        const spec = generateSpec('GET /api/update/name/after');
        swagger = Convert.getInstance().syncSwaggerJson(spec, generateSwagger('/api/update/name/before'));
      });

      it('should be have correct swagger', () => {
        assert.notNestedProperty(swagger, 'paths./api/update/name/before'); // this api name is defined in swagger_extention.json
        assert.nestedProperty(swagger, 'paths./api/update/name/after')
      });
    });

    describe('api methody type updated', () => {
      before('run', () => {
        const spec = generateSpec('GET /newApi');
        swagger = Convert.getInstance().syncSwaggerJson(spec, generateSwagger('/newApi'));
      });

      it('should be have correct swagger', () => {
        assert.notNestedProperty(swagger, 'paths./newApi.post');
        assert.nestedProperty(swagger, 'paths./newApi.get');
      });
    });
  });

  describe('query in parameters', () => {
    describe('param have extention propertites', () => {
      before('run', () => {
        swagger = Convert.getInstance().syncSwaggerJson(
          generateSpec('Get /query/base'),
          generateSwagger('/query/base')
        );
        operation_object = Swagger.getOperationObjectFromSwagger(swagger, '/query/base', 'get');
      });

      it('should be have correct swagger', () => {
        const schema = Swagger.getParametersSchema(operation_object);
        assert.strictEqual(schema.length, 1);
        assert.nestedPropertyVal(schema[0], 'in', 'query');
        assert.nestedPropertyVal(schema[0], 'name', 'param1');
        assert.nestedPropertyVal(schema[0], 'required', false);
        assert.nestedPropertyVal(schema[0], 'schema.description', 'string kkk');
        assert.nestedPropertyVal(schema[0], 'schema.maxLength', 100);
        assert.nestedPropertyVal(schema[0], 'schema.type', Swagger.dataType.string);
      });
    });

    describe('new param and can show correctly', () => {
      before('run', () => {
        swagger = Convert.getInstance().syncSwaggerJson(
          generateSpec('Get /query/created'),
          generateSwagger('/query/created')
        );
        operation_object = Swagger.getOperationObjectFromSwagger(swagger, '/query/created', 'get');
      });

      it('should be have correct swagger', () => {
        const schema = Swagger.getParametersSchema(operation_object);
        assert.strictEqual(schema.length, 2);
        assert.nestedPropertyVal(schema[0], 'in', 'query');
        assert.nestedPropertyVal(schema[0], 'name', 'param1');
        assert.nestedPropertyVal(schema[0], 'required', false);
        assert.nestedPropertyVal(schema[0], 'schema.description', 'string kkk');
        assert.nestedPropertyVal(schema[0], 'schema.maxLength', 100);
        assert.nestedPropertyVal(schema[0], 'schema.type', Swagger.dataType.string);
        assert.nestedPropertyVal(schema[1], 'in', 'query');
        assert.nestedPropertyVal(schema[1], 'name', 'param2');
        assert.nestedPropertyVal(schema[1], 'required', false);
        assert.nestedPropertyVal(schema[1], 'schema.description', 'string aaa');
        assert.nestedPropertyVal(schema[1], 'schema.type', Swagger.dataType.string);
      });
    });

    describe('type of param is different with extention propertities', () => {
      before('run', () => {
        swagger = Convert.getInstance().syncSwaggerJson(
          generateSpec('Get /query/different'),
          generateSwagger('/query/different')
        );
        operation_object = Swagger.getOperationObjectFromSwagger(swagger, '/query/different', 'get');
      });

      it('should be have correct swagger', () => {
        const schema = Swagger.getParametersSchema(operation_object);
        assert.strictEqual(schema.length, 1);
        assert.nestedPropertyVal(schema[0], 'in', 'query');
        assert.nestedPropertyVal(schema[0], 'name', 'param1');
        assert.nestedPropertyVal(schema[0], 'required', false);
        assert.nestedPropertyVal(schema[0], 'schema.description', 'string');
        assert.nestedPropertyVal(schema[0], 'schema.type', Swagger.dataType.string);
      });
    });

    describe('extention param is object and need recursive', () => {
      before('run', () => {
        swagger = Convert.getInstance().syncSwaggerJson(
          generateSpec('Get /query/resursive'),
          generateSwagger('/query/resursive')
        );
        operation_object = Swagger.getOperationObjectFromSwagger(swagger, '/query/resursive', 'get');
      });

      it('should be have correct swagger', () => {
        const schema = Swagger.getParametersSchema(operation_object);
        assert.strictEqual(schema.length, 1);
        assert.nestedPropertyVal(schema[0], 'in', 'query');
        assert.nestedPropertyVal(schema[0], 'name', 'param');
        assert.nestedPropertyVal(schema[0], 'required', false);
        assert.nestedPropertyVal(schema[0], 'schema.type', Swagger.dataType.object);
        assert.nestedPropertyVal(schema[0], 'schema.propertities.sub_param.type', Swagger.dataType.object);
        assert.nestedPropertyVal(schema[0], 'schema.propertities.sub_param.description', 'sub');
        assert.nestedPropertyVal(schema[0], 'schema.propertities.sub_param.propertities.sub_sub_param.type', Swagger.dataType.string);
        assert.nestedPropertyVal(schema[0], 'schema.propertities.sub_param.propertities.sub_sub_param.description', 'sub_sub');
      });
    });

    describe('extention param has been deleted', () => {
      before('run', () => {
        swagger = Convert.getInstance().syncSwaggerJson(
          generateSpec('Get /query/deleted'),
          generateSwagger('/query/deleted')
        );
        operation_object = Swagger.getOperationObjectFromSwagger(swagger, '/query/deleted', 'get');
      });

      it('should be have correct swagger', () => {
        const schema = Swagger.getParametersSchema(operation_object);
        assert.strictEqual(schema.length, 1);
        assert.nestedPropertyVal(schema[0], 'in', 'query');
        assert.nestedPropertyVal(schema[0], 'name', 'param_new');
        assert.nestedPropertyVal(schema[0], 'required', false);
        assert.nestedPropertyVal(schema[0], 'schema.description', 'string');
        assert.nestedPropertyVal(schema[0], 'schema.type', Swagger.dataType.string);
      });
    });
  });

  describe('path changed', () => {

  });

  describe('request body changed', () => {

  });

  describe('response changed', () => {

  });
});
