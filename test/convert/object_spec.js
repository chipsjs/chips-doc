const { assert } = require('chai');
const fs = require('fs');
const _ = require('lodash');

const Convert = require('../../middleware/convert/spec_convert');

describe('convert spec to auto generate tag', () => {
  let specJson = {};
  let specResult = {};

  before('init convert task', () => {
    Convert.initialize({ log_module: console });
  })

  describe('object spec | has required object in query', () => {
    before('set source data', () => {
      specJson = {
        'GET /test': {
          name: 'check  whether an email or phone exists',
          summary: 'check email or phone for duplicates',
          method: 'get',
          request: {
            query: {
              required: {
                email: '[optional] string: user email',
                phone: '[required] string: user phone number,standard format is E164'
              }
            }
          },
          response: {
            body: {
              exists: 'boolean',
              msg: 'string: detail message'
            },
          },
          note: 'it will return true or false to check if user is register and return detail msg after exists == false. request query are optional '
              + 'between email and phone, but will return 4xx err_code if query body is not one of these'
        }
      };
    });

    before('convert special spec to api doc', () => {
      specResult = Convert.getInstance().run(specJson, './test/convert/temp/special');
    });

    it('should generate correct api doc', () => {
      const api_name = '/test';
      assert.exists(specResult[api_name]);
      assert.exists(specResult[api_name].get);

      const {
        description, summary: outputSummary,
      } = specResult[api_name].get;
      const {
        summary: inputSummary,
        note,
        response: { body: inputResponse }
      } = specJson['GET /test'];

      assert.strictEqual(outputSummary, inputSummary);
      assert.strictEqual(description, note);
      const outputParameters = _.get(specResult[api_name], ['get', 'parameters']);
      const inputQuery = _.get(specJson, ['GET /test', 'request', 'query', 'required']);
      assert.strictEqual(outputParameters.length, 3);
      assert.strictEqual(outputParameters[0].name, 'email');
      assert.strictEqual(outputParameters[0].in, 'query');
      assert.strictEqual(outputParameters[0].required, true);
      assert.nestedPropertyVal(outputParameters[0], 'schema.description', inputQuery.email);
      assert.nestedPropertyVal(outputParameters[0], 'schema.type', 'string');
      assert.strictEqual(outputParameters[1].name, 'phone');
      assert.strictEqual(outputParameters[1].in, 'query');
      assert.strictEqual(outputParameters[1].required, true);
      assert.nestedPropertyVal(outputParameters[1], 'schema.description', inputQuery.phone);
      assert.nestedPropertyVal(outputParameters[1], 'schema.type', 'string');
      const outputResponseBody = _.get(specResult[api_name], ['get', 'responses', '200', 'content', 'application/json', 'schema']);
      assert.nestedPropertyVal(outputResponseBody, 'properties.exists.type', 'boolean');
      assert.nestedPropertyVal(outputResponseBody, 'properties.exists.description', inputResponse.exists);
      assert.nestedPropertyVal(outputResponseBody, 'properties.msg.type', 'string');
      assert.nestedPropertyVal(outputResponseBody, 'properties.msg.description', inputResponse.msg);
    });

    after('clean file', () => {
      fs.unlinkSync('test/convert/temp/special.json');
    })
  });

  describe('object spec | has required object in body', () => {
    before('set source data', () => {
      specJson = {
        'POST /test': {
          name: 'check  whether an email or phone exists',
          summary: 'check email or phone for duplicates',
          method: 'post',
          request: {
            body: {
              required: {
                email: 'string: user email',
              }
            }
          },
          response: {
            body: {
              exists: 'boolean',
            },
          },
          note: 'it will return true or false to check if user is register and return detail msg after exists == false. request query are optional '
              + 'between email and phone, but will return 4xx err_code if query body is not one of these'
        }
      };
    });

    before('convert special spec to api doc', () => {
      specResult = Convert.getInstance().run(specJson, 'test/convert/temp/special');
    });

    it('should generate correct api doc', () => {
      const api_name = '/test';
      assert.exists(specResult[api_name]);
      assert.exists(specResult[api_name].post);

      const {
        description, summary: outputSummary,
      } = specResult[api_name].post;
      const {
        summary: inputSummary,
        note,
        response: { body: inputResponse }
      } = specJson['POST /test'];

      assert.strictEqual(outputSummary, inputSummary);
      assert.strictEqual(description, note);

      const outputRequestBody = _.get(specResult, [api_name, 'post', 'requestBody', 'content', 'application/json', 'schema']);
      assert.strictEqual(outputRequestBody.type, 'object');
      assert.nestedPropertyVal(outputRequestBody, 'properties.email.type', 'string');
      assert.deepEqual(outputRequestBody.required, ['email']);
      const inputBody = _.get(specJson, ['POST /test', 'request', 'body', 'required']);
      assert.nestedPropertyVal(outputRequestBody, 'properties.email.description', inputBody.email);

      const outputResponseBody = _.get(specResult[api_name], ['post', 'responses', '200', 'content', 'application/json', 'schema']);
      assert.nestedPropertyVal(outputResponseBody, 'properties.exists.type', 'boolean');
      assert.nestedPropertyVal(outputResponseBody, 'properties.exists.description', inputResponse.exists);
    });

    after('clean file', () => {
      fs.unlinkSync('test/convert/temp/special.json');
    })
  });

  describe('object spec | properties are id1, id2, id3, id4', () => {
    before('set source data', () => {
      specJson = {
        '/test': {
          method: 'get',
          response: {
            body: {
              ifPresent: {
                special2: {
                  a: 'type of a1',
                  a2: 'type of a:2',
                  '...': '...',
                  aN: 'type of a'
                },
                special1: ['u1', 'u2'],
                normal: {
                  email: 'string: type of email'
                }
              }
            }
          }
        }
      }
    });

    before('convert normal spec to api doc', () => {
      specResult = Convert.getInstance().run(specJson, 'test/convert/temp/special');
    });

    it('should generate correct api doc', () => {
      const api_name = '/test';
      assert.exists(specResult[api_name]);
      assert.exists(specResult[api_name].get);
      const schema = _.get(specResult, [api_name, 'get', 'responses', '200', 'content', 'application/json', 'schema']);
      assert.nestedPropertyVal(schema, 'properties.special1.type', 'array');
      assert.nestedPropertyVal(schema, 'properties.special1.description', 'u1');
      assert.nestedPropertyVal(schema, 'properties.special2.type', 'object');
      assert.nestedPropertyVal(schema, 'properties.special2.properties.a.description', 'type of a1');
      assert.nestedPropertyVal(schema, 'properties.normal.type', 'object');
      assert.nestedPropertyVal(schema, 'properties.normal.properties.email.type', 'string');
      assert.nestedPropertyVal(schema, 'properties.normal.properties.email.description', 'string: type of email');
    });

    after('clean file', () => {
      fs.unlinkSync('test/convert/temp/special.json');
    });
  })
});
