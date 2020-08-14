const { assert } = require('chai');
const _ = require('lodash');
const Convert = require('../../middleware/convert/spec_convert');
const { Swagger } = require('../../lib');
const { generateSpec, generateSwagger } = require('./helper');

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
        assert.strictEqual(schema.length, 2);
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
        assert.strictEqual(schema.length, 3);
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

    describe('type of param is different with extention properties', () => {
      before('run', () => {
        swagger = Convert.getInstance().syncSwaggerJson(
          generateSpec('Get /query/different'),
          generateSwagger('/query/different')
        );
        operation_object = Swagger.getOperationObjectFromSwagger(swagger, '/query/different', 'get');
      });

      it('should be have correct swagger', () => {
        const schema = Swagger.getParametersSchema(operation_object);
        assert.strictEqual(schema.length, 2);
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
          generateSpec('Get /query/recursive'),
          generateSwagger('/query/recursive')
        );
        operation_object = Swagger.getOperationObjectFromSwagger(swagger, '/query/recursive', 'get');
      });

      it('should be have correct swagger', () => {
        const schema = Swagger.getParametersSchema(operation_object);
        assert.strictEqual(schema.length, 2);
        assert.nestedPropertyVal(schema[0], 'in', 'query');
        assert.nestedPropertyVal(schema[0], 'name', 'param');
        assert.nestedPropertyVal(schema[0], 'required', false);
        assert.nestedPropertyVal(schema[0], 'schema.type', Swagger.dataType.object);
        assert.nestedPropertyVal(schema[0], 'schema.properties.sub_param.type', Swagger.dataType.object);
        assert.nestedPropertyVal(schema[0], 'schema.properties.sub_param.description', 'sub');
        assert.nestedPropertyVal(schema[0], 'schema.properties.sub_param.properties.sub_sub_param.type', Swagger.dataType.string);
        assert.nestedPropertyVal(schema[0], 'schema.properties.sub_param.properties.sub_sub_param.description', 'sub sub spec');
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
        assert.strictEqual(schema.length, 2);
        assert.nestedPropertyVal(schema[0], 'in', 'query');
        assert.nestedPropertyVal(schema[0], 'name', 'param_new');
        assert.nestedPropertyVal(schema[0], 'required', false);
        assert.nestedPropertyVal(schema[0], 'schema.description', 'string');
        assert.nestedPropertyVal(schema[0], 'schema.type', Swagger.dataType.string);
      });
    });
  });

  describe('path have addtional schema', () => {
    before('run', () => {
      swagger = Convert.getInstance().syncSwaggerJson(
        generateSpec('Get /path/:name'),
        generateSwagger('/path/:name')
      );
    });

    it('should be have correct swagger', () => {
      const parameters = _.get(swagger, ['paths', '/path/:name']);
      const schema = Swagger.getParametersSchema(parameters);
      assert.strictEqual(schema.length, 1);
      assert.nestedPropertyVal(schema[0], 'in', 'path');
      assert.nestedPropertyVal(schema[0], 'name', 'name');
      assert.nestedPropertyVal(schema[0], 'required', true);
      assert.nestedPropertyVal(schema[0], 'schema.description', 'aaa');
      assert.nestedPropertyVal(schema[0], 'schema.maxLength', 100);
      assert.nestedPropertyVal(schema[0], 'schema.type', Swagger.dataType.string);
    });
  });

  describe('request body changed', () => {
    describe('param have extention properties', () => {
      before('run', () => {
        swagger = Convert.getInstance().syncSwaggerJson(
          generateSpec('Post /body/base'),
          generateSwagger('/body/base')
        );
        operation_object = Swagger.getOperationObjectFromSwagger(swagger, '/body/base', 'post');
      });

      it('should be have correct swagger', () => {
        const schema = Swagger.getRequestBodySchema(operation_object);
        assert.exists(schema, 'properties.param');
        assert.nestedPropertyVal(schema, 'properties.param.type', 'string');
        assert.nestedPropertyVal(schema, 'properties.param.maxLength', 100);
      });
    });

    describe('new param and can show correctly', () => {
      describe('param have extention properties', () => {
        before('run', () => {
          swagger = Convert.getInstance().syncSwaggerJson(
            generateSpec('Post /body/created'),
            generateSwagger('/body/created')
          );
          operation_object = Swagger.getOperationObjectFromSwagger(swagger, '/body/created', 'post');
        });

        it('should be have correct swagger', () => {
          const schema = Swagger.getRequestBodySchema(operation_object);
          assert.exists(schema, 'properties.param');
          assert.nestedPropertyVal(schema, 'properties.param.type', 'string');
          assert.nestedPropertyVal(schema, 'properties.param.maxLength', 100);
          assert.nestedPropertyVal(schema, 'properties.new_param.type', 'string');
          assert.nestedPropertyVal(schema, 'properties.new_param.description', 'string aaa');
        });
      })
    });

    describe('type of param is different with extention properties', () => {
      before('run', () => {
        swagger = Convert.getInstance().syncSwaggerJson(
          generateSpec('Post /body/different'),
          generateSwagger('/body/different')
        );
        operation_object = Swagger.getOperationObjectFromSwagger(swagger, '/body/different', 'post');
      });

      it('should be have correct swagger', () => {
        const schema = Swagger.getRequestBodySchema(operation_object);
        assert.exists(schema, 'properties.param');
        assert.nestedPropertyVal(schema, 'properties.param.type', 'string');
      });
    });

    describe('extention param has been deleted', () => {
      before('run', () => {
        swagger = Convert.getInstance().syncSwaggerJson(
          generateSpec('Post /body/deleted'),
          generateSwagger('/body/deleted')
        );
        operation_object = Swagger.getOperationObjectFromSwagger(swagger, '/body/deleted', 'post');
      });

      it('should be have correct swagger', () => {
        const schema = Swagger.getRequestBodySchema(operation_object);
        assert.nestedProperty(schema, 'properties.param');
        assert.notNestedProperty(schema, 'properties.param_deleted');
      });
    });

    describe('extention param is object and need recursive', () => {
      before('run', () => {
        swagger = Convert.getInstance().syncSwaggerJson(
          generateSpec('Post /body/recursive'),
          generateSwagger('/body/recursive')
        );
        operation_object = Swagger.getOperationObjectFromSwagger(swagger, '/body/recursive', 'post');
      });

      it('should be have correct swagger', () => {
        const schema = Swagger.getRequestBodySchema(operation_object);
        assert.nestedPropertyVal(schema, 'properties.param.type', Swagger.dataType.object);
        assert.nestedPropertyVal(schema, 'properties.param.properties.sub_param.description', 'sub');
        assert.nestedPropertyVal(schema, 'properties.param.properties.sub_param.type', Swagger.dataType.object);
        assert.nestedPropertyVal(schema, 'properties.param.properties.sub_param.properties.sub_sub_param.type', Swagger.dataType.string);
        assert.nestedPropertyVal(schema, 'properties.param.properties.sub_param.properties.sub_sub_param.maxLength', 100);
        assert.nestedPropertyVal(schema, 'properties.param.properties.sub_param.properties.sub_sub_param.description', 'sub sub spec');
      });
    });
  });

  describe('response schema changed', () => {
    describe('param have extention properties', () => {
      before('run', () => {
        swagger = Convert.getInstance().syncSwaggerJson(
          generateSpec('Post /response/base'),
          generateSwagger('/response/base')
        );
        operation_object = Swagger.getOperationObjectFromSwagger(swagger, '/response/base', 'post');
      });

      it('should be have correct swagger', () => {
        const schema = Swagger.getResponseSchema(operation_object);
        assert.exists(schema, 'properties.param');
        assert.nestedPropertyVal(schema, 'properties.param.type', 'string');
        assert.nestedPropertyVal(schema, 'properties.param.maxLength', 100);
        assert.nestedPropertyVal(schema, 'properties.param.description', 'string aaaa');
      });
    })
  });

  // describe('api no exist in base but exist in extention', () => {
  //   before('run', () => {
  //     swagger = Convert.getInstance().syncSwaggerJson(
  //       {},
  //       generateSwagger('/addtional')
  //     );
  //     operation_object = Swagger.getOperationObjectFromSwagger(swagger, '/addtional', 'post');
  //   });

  //   it('should be have correct swagger', () => {
  //     const schema = Swagger.getRequestBodySchema(operation_object);
  //     assert.nestedPropertyVal(schema, 'properties.param.type', Swagger.dataType.object);
  //     assert.nestedPropertyVal(schema, 'properties.param.properties.param.type', Swagger.dataType.number);
  //   });
  // });
});
