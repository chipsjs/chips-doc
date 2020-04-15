const { assert } = require('chai');
const fs = require('fs');

const Convert = require('../middleware/convert/spec_convert');

describe('convert spec to generate api doc', () => {
  let specJson = {};
  let specResult = {};

  before('init convert task', () => {
    Convert.initialize({ log_module: console });
  })

  describe('normal spec', () => {
    before('set source data', () => {
      specJson = {
        'GET /test1': {
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
      specResult = Convert.getInstance().run(specJson, 'test/temp/normal');
    });

    it('should generate correct api doc', () => {
      const api_name = 'GET /test1';

      const {
        method_type, summary: outputSummary,
        request: { query: outputRequestQuery },
        response: { success: outputResponseBody }
      } = specResult[api_name];
      const {
        method,
        summary: inputSummary,
        request: { query: inputQuery },
        response: { body: inputResponse }
      } = specJson[api_name];

      assert.equal(method_type, method);
      assert.equal(outputSummary, inputSummary);
      assert.exists(outputRequestQuery.type);
      assert.nestedPropertyVal(outputRequestQuery, 'properties.email.description', inputQuery.email);
      assert.nestedPropertyVal(outputRequestQuery, 'properties.email.type', 'string');
      assert.nestedPropertyVal(outputRequestQuery, 'properties.phone.description', inputQuery.phone);
      assert.nestedPropertyVal(outputRequestQuery, 'properties.phone.type', 'string');
      assert.sameMembers(outputRequestQuery.required, ['phone']);
      assert.nestedPropertyVal(outputResponseBody, 'properties.exists.type', 'boolean');
      assert.nestedPropertyVal(outputResponseBody, 'properties.exists.description', inputResponse.exists);
      assert.nestedPropertyVal(outputResponseBody, 'properties.msg.type', 'string');
      assert.nestedPropertyVal(outputResponseBody, 'properties.msg.description', inputResponse.msg);
    });

    after('clean file', () => {
      fs.unlinkSync('test/temp/normal_api_doc.json');
    })
  });

  describe('special spec | has required object', () => {
    before('set source data', () => {
      specJson = {
        'GET /test2': {
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
      specResult = Convert.getInstance().run(specJson, 'test/temp/special');
    });

    it('should generate correct api doc', () => {
      const api_name = 'GET /test2';

      const {
        method_type, summary: outputSummary,
        request: { query: outputRequestQuery },
        response: { success: outputResponseBody }
      } = specResult[api_name];
      const {
        method,
        summary: inputSummary,
        request: { query: { required: inputQuery } },
        response: { body: inputResponse }
      } = specJson[api_name];

      assert.equal(method_type, method);
      assert.equal(outputSummary, inputSummary);
      assert.exists(outputRequestQuery.type);
      assert.nestedPropertyVal(outputRequestQuery, 'properties.email.description', inputQuery.email);
      assert.nestedPropertyVal(outputRequestQuery, 'properties.email.type', 'string');
      assert.nestedPropertyVal(outputRequestQuery, 'properties.phone.description', inputQuery.phone);
      assert.nestedPropertyVal(outputRequestQuery, 'properties.phone.type', 'string');
      assert.sameMembers(outputRequestQuery.required, ['email', 'phone']);
      assert.nestedPropertyVal(outputResponseBody, 'properties.exists.type', 'boolean');
      assert.nestedPropertyVal(outputResponseBody, 'properties.exists.description', inputResponse.exists);
      assert.nestedPropertyVal(outputResponseBody, 'properties.msg.type', 'string');
      assert.nestedPropertyVal(outputResponseBody, 'properties.msg.description', inputResponse.msg);
    });

    after('clean file', () => {
      fs.unlinkSync('test/temp/special_api_doc.json');
    })
  });

  describe('special spec | method type instead of method and method is uppercase', () => {
    before('set source data', () => {
      specJson = {
        'GET /test': {
          name: 'check  whether an email or phone exists',
          summary: 'check email or phone for duplicates',
          method_type: 'GET',
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
          }
        }
      };
    });

    before('convert special spec to api doc', () => {
      specResult = Convert.getInstance().run(specJson, 'test/temp/special');
    });

    it('should generate correct api doc', () => {
      const api_name = 'GET /test';

      const {
        method_type, summary: outputSummary,
        request: { query: outputRequestQuery },
        response: { success: outputResponseBody }
      } = specResult[api_name];
      const {
        summary: inputSummary,
        request: { query: inputQuery },
        response: { body: inputResponse }
      } = specJson[api_name];

      assert.equal(method_type, 'get');
      assert.equal(outputSummary, inputSummary);
      assert.exists(outputRequestQuery.type);
      assert.nestedPropertyVal(outputRequestQuery, 'properties.email.description', inputQuery.email);
      assert.nestedPropertyVal(outputRequestQuery, 'properties.email.type', 'string');
      assert.nestedPropertyVal(outputRequestQuery, 'properties.phone.description', inputQuery.phone);
      assert.nestedPropertyVal(outputRequestQuery, 'properties.phone.type', 'string');
      assert.sameMembers(outputRequestQuery.required, ['phone']);
      assert.nestedPropertyVal(outputResponseBody, 'properties.exists.type', 'boolean');
      assert.nestedPropertyVal(outputResponseBody, 'properties.exists.description', inputResponse.exists);
      assert.nestedPropertyVal(outputResponseBody, 'properties.msg.type', 'string');
      assert.nestedPropertyVal(outputResponseBody, 'properties.msg.description', inputResponse.msg);
    });

    after('clean file', () => {
      fs.unlinkSync('test/temp/special_api_doc.json');
    })
  });

  describe('sepcial spec | has special type, such as int/Boolean', () => {
    before('set source data', () => {
      specJson = {
        'GET /test': {
          method_type: 'GET',
          request: {
            body: {
                year: 'int'
            }
          },
          response: {
            body: {
              exists: 'Boolean',
            },
          }
        }
      };
    });

    before('convert special spec to api doc', () => {
      specResult = Convert.getInstance().run(specJson, 'test/temp/special');
    });

    it('should generate correct api doc', () => {
      const api_name = 'GET /test';

      const {
        method_type,
        request: { body: outputRequestQuery },
        response: { success: outputResponseBody }
      } = specResult[api_name];
      const {
        summary: inputSummary,
        request: { body: inputQuery },
        response: { body: inputResponse }
      } = specJson[api_name];

      assert.equal(method_type, 'get');
      assert.exists(outputRequestQuery.type);
      assert.nestedPropertyVal(outputRequestQuery, 'properties.year.description', inputQuery.year);
      assert.nestedPropertyVal(outputRequestQuery, 'properties.year.type', 'number');
      
      assert.nestedPropertyVal(outputResponseBody, 'properties.exists.type', 'boolean');
      assert.nestedPropertyVal(outputResponseBody, 'properties.exists.description', inputResponse.exists);
    });

    after('clean file', () => {
      fs.unlinkSync('test/temp/special_api_doc.json');
    })
  });

  describe('special spec | unkown type', () => {
    before('set source data', () => {
      specJson = {
        'GET /test': {
          method_type: 'Get',
          request: {
            body: {
              year: 'birdary year'
            }
          },
          response: {
          }
        }
      };
    });

    before('convert special spec to api doc', () => {
      specResult = Convert.getInstance().run(specJson, 'test/temp/special');
    });

    it('should generate correct api doc', () => {
      const api_name = 'GET /test';

      const {
        method_type,
        request: { body: outputRequestQuery }
      } = specResult[api_name];
      const {
        request: { body: inputQuery }
      } = specJson[api_name];

      assert.equal(method_type, 'get');
      assert.exists(outputRequestQuery.type);
      assert.nestedPropertyVal(outputRequestQuery, 'properties.year.description', inputQuery.year);
      assert.nestedPropertyVal(outputRequestQuery, 'properties.year.type', 'unknown');
    });

    after('clean file', () => {
      fs.unlinkSync('test/temp/special_api_doc.json');
    })
  });

  describe('multi spec ', () => {
    before('set source data', () => {
      specJson = {
        'GET /test1': {
          name: 'check  whether an email or phone exists',
          summary: 'check email or phone for duplicates',
          method: 'get',
          request: {
            query: {
              optional: {
                email: 'string: user email',
                phone: 'string: user phone number,standard format is E164'
              }
            }
          },
          response: {
            body: {
              exists: 'boolean',
              msg: 'string: detail message'
            },
          },
        },
        'GET /test2': {
          name: 'check  whether an email or phone exists',
          summary: 'check email or phone for duplicates',
          method: 'get',
          request: {
            query: {
              required: {
                email: 'string: user email',
                phone: 'string: user phone number,standard format is E164'
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

    before('convert multi spec to api doc', () => {
      specResult = Convert.getInstance().run(specJson, 'test/temp/multi');
    });

    it('should generate correct api doc', () => {
      {
        const {
          method_type, summary: outputSummary,
          request: { query: outputRequestQuery },
          response: { success: outputResponseBody }
        } = specResult['GET /test1'];
        const {
          method,
          summary: inputSummary,
          request: { query: { optional: inputQuery } },
          response: { body: inputResponse }
        } = specJson['GET /test1'];

        assert.equal(method_type, method);
        assert.equal(outputSummary, inputSummary);
        assert.exists(outputRequestQuery.type);
        assert.nestedPropertyVal(outputRequestQuery, 'properties.email.description', inputQuery.email);
        assert.nestedPropertyVal(outputRequestQuery, 'properties.email.type', 'string');
        assert.nestedPropertyVal(outputRequestQuery, 'properties.phone.description', inputQuery.phone);
        assert.nestedPropertyVal(outputRequestQuery, 'properties.phone.type', 'string');
        assert.strictEqual(outputRequestQuery.required.length, 0);
        assert.nestedPropertyVal(outputResponseBody, 'properties.exists.type', 'boolean');
        assert.nestedPropertyVal(outputResponseBody, 'properties.exists.description', inputResponse.exists);
        assert.nestedPropertyVal(outputResponseBody, 'properties.msg.type', 'string');
        assert.nestedPropertyVal(outputResponseBody, 'properties.msg.description', inputResponse.msg);  
      }

      {
        const {
          method_type, summary: outputSummary,
          request: { query: outputRequestQuery },
          response: { success: outputResponseBody }
        } = specResult['GET /test2'];
        const {
          method,
          summary: inputSummary,
          request: { query: { required: inputQuery } },
          response: { body: inputResponse }
        } = specJson['GET /test2'];

        assert.equal(method_type, method);
        assert.equal(outputSummary, inputSummary);
        assert.exists(outputRequestQuery.type);
        assert.nestedPropertyVal(outputRequestQuery, 'properties.email.description', inputQuery.email);
        assert.nestedPropertyVal(outputRequestQuery, 'properties.email.type', 'string');
        assert.nestedPropertyVal(outputRequestQuery, 'properties.phone.description', inputQuery.phone);
        assert.nestedPropertyVal(outputRequestQuery, 'properties.phone.type', 'string');
        assert.sameMembers(outputRequestQuery.required, ['email', 'phone']);
        assert.nestedPropertyVal(outputResponseBody, 'properties.exists.type', 'boolean');
        assert.nestedPropertyVal(outputResponseBody, 'properties.exists.description', inputResponse.exists);
        assert.nestedPropertyVal(outputResponseBody, 'properties.msg.type', 'string');
        assert.nestedPropertyVal(outputResponseBody, 'properties.msg.description', inputResponse.msg);
      }
    });

    after('clean file', () => {
      fs.unlinkSync('test/temp/multi_api_doc.json');
    })
  });
});
