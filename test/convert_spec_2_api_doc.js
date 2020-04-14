const { assert } = require('chai');

const Convert = require('../middleware/convert/spec_convert');

describe('convert_spec_2_api_doc', () => {
  let normalSpecJson = {};
  let normalSpecResult = {};

  describe('single normal spec', () => {
    before('set source data', () => {
      normalSpecJson = {
        'GET /users/checkExist': {
          name: 'check  whether an email or phone exists',
          summary: 'check email or phone for duplicates',
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
          note: 'it will return true or false to check if user is register and return detail msg after exists == false. request query are optional '
              + 'between email and phone, but will return 4xx err_code if query body is not one of these'
        }
      };
    });

    before('convert normal spec to api doc', () => {
      Convert.initialize({ log_module: console });
      normalSpecResult = Convert.getInstance().run(normalSpecJson, 'test/temp/normal');
    });

    it('should generate correct api doc', () => {
      const api_name = 'GET /users/checkExist';

      const {
        method_type, summary,
        request: { query: outputRequestQuery },
        response: { success: outputResponseBody }
      } = normalSpecResult[api_name];
      const {
        query: inputQuery,
        response: { body: inputResponse }
      } = normalSpecJson.request;

      assert.equal(method_type, normalSpecJson.method);
      assert.equal(summary, normalSpecJson.summary);
      assert.exists(outputRequestQuery.type);
      assert.nestedPropertyVal(outputRequestQuery, 'properties.email.description', inputQuery.email);
      assert.nestedPropertyVal(outputRequestQuery, 'properties.email.type', 'string');
      assert.nestedPropertyVal(outputRequestQuery, 'properties.phone.description', inputQuery.phone);
      assert.nestedPropertyVal(outputRequestQuery, 'properties.phone.type', 'string');
      assert.equal(outputRequestQuery.required, ['phone']);
      assert.exists(outputResponseBody.success);
      assert.nestedPropertyVal(outputResponseBody, 'success.properties.exists.type', 'boolean');
      assert.nestedPropertyVal(outputResponseBody, 'success.properties.exists.description', inputResponse.exists);
      assert.nestedPropertyVal(outputResponseBody, 'success.properties.msg.type', 'string');
      assert.nestedPropertyVal(outputResponseBody, 'success.properties.msg.description', inputResponse.msg);
    });
  });

  //describe('special spec');

  //describe('multi spec ');

  after('clean env', () => {
    //del temp dir
  });
});
