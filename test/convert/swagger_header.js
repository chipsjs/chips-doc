const { assert } = require('chai');

const Convert = require('../../middleware/convert/spec_convert');
const { Swagger } = require('../../lib');
const { generateSpec, generateSwagger } = require('./helper');

describe('header', () => {
  before('init convert task', () => {
    Convert.initialize({ log_module: console });
  });

  describe('query', () => {
    let operation_object;

    before('run', () => {
      const swagger = Convert.getInstance().syncSwaggerJson(
        generateSpec('Get /query/base'),
        generateSwagger('/query/base')
      );
      operation_object = Swagger.getOperationObjectFromSwagger(swagger, '/query/base', 'get');
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
      assert.nestedPropertyVal(schema[1], 'in', 'header');
      assert.nestedPropertyVal(schema[1], 'name', 'accept-version');
      assert.nestedPropertyVal(schema[1], 'required', false);
      assert.nestedPropertyVal(schema[1], 'description', 'api version, default is 0.0.1');
      assert.nestedPropertyVal(schema[1], 'schema.default', '0.0.1');
      assert.strictEqual(schema[1].schema.enum.length, 1);
      assert.nestedPropertyVal(schema[1], 'schema.enum.0', '0.0.1');
    });
  });

  describe('post', () => {
    let operation_object;

    before('run', () => {
      const swagger = Convert.getInstance().syncSwaggerJson(
        generateSpec('Post /body/base'),
        generateSwagger('/body/base'),
        '0.0.2'
      );
      operation_object = Swagger.getOperationObjectFromSwagger(swagger, '/body/base', 'post');
    });

    it('should be have correct swagger', () => {
      const schema = Swagger.getParametersSchema(operation_object);
      assert.strictEqual(schema.length, 1);
      assert.nestedPropertyVal(schema[0], 'in', 'header');
      assert.nestedPropertyVal(schema[0], 'name', 'accept-version');
      assert.nestedPropertyVal(schema[0], 'required', false);
      assert.nestedPropertyVal(schema[0], 'description', 'api version, default is 0.0.1');
      assert.nestedPropertyVal(schema[0], 'schema.default', '0.0.1');
      assert.strictEqual(schema[0].schema.enum.length, 1);
      assert.nestedPropertyVal(schema[0], 'schema.enum.0', '0.0.2');
    });
  });
})
