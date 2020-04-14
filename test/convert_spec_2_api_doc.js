const { assert } = require('chai');

const Convert = require('../middleware/convert/spec_convert');

describe('convert_spec_2_api_doc', () => {
  let normalSpecJson = {};
  let normalSpecResult = {};

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
    assert.equal(normalSpecResult.method_type, normalSpecJson.method);
    assert.equal(normalSpecResult.summary, normalSpecJson.summary);

    const { request } = normalSpecResult;

    assert.exists(request.query.type);
    assert.nestedPropertyVal(request, 'query.properties.email.description', normalSpecJson.request.query.email);
    assert.exists(request.query.properties.email.type);
    assert.equal(request.query.properties.phone.description, normalSpecJson.request.query.phone);
    assert.exists(request.query.properties.phone.type);
    assert.equal(request.query.required, ['phone']);
  });

  after('clean env', () => {

  });
});
