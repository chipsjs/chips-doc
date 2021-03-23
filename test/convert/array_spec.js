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

  describe('array spec | object array', () => {
    before('set source data', () => {
      specJson = {
        'POST /test': {
          method: 'post',
          request: {
            body: {
              users: [{
                userid: '123',
                status: '1'
              }]
            }
          }
        }
      }
    });

    before('convert normal spec to api doc', () => {
      specResult = Convert.getInstance().run(specJson, 'test/convert/temp/array');
    });

    it('should generate correct api doc', () => {
      const api_name = '/test';
      assert.exists(specResult[api_name]);
      assert.exists(specResult[api_name].post);

      const users = _.get(specResult, [api_name, 'post', 'requestBody', 'content', 'application/json', 'schema', 'properties', 'users']);
      assert.strictEqual(users.type, 'array');
      assert.nestedPropertyVal(users, 'items.type', 'object');
      assert.nestedPropertyVal(users, 'items.properties.status.description', '1');
      assert.nestedPropertyVal(users, 'items.properties.userid.description', '123');
    });

    after('clean file', () => {
      fs.unlinkSync('test/convert/temp/array.json');
    });
  });

  describe('array spec | string array', () => {
    before('set source data', () => {
      specJson = {
        'POST /test': {
          method: 'post',
          request: {
            body: {
              users: ['userid', 'userid1']
            }
          }
        }
      }
    });

    before('convert normal spec to api doc', () => {
      specResult = Convert.getInstance().run(specJson, 'test/convert/temp/array');
    });

    it('should generate correct api doc', () => {
      const api_name = '/test';
      assert.exists(specResult[api_name]);
      assert.exists(specResult[api_name].post);

      const users = _.get(specResult, [api_name, 'post', 'requestBody', 'content', 'application/json', 'schema', 'properties', 'users']);
      assert.strictEqual(users.type, 'array');
      assert.nestedProperty(users, 'items');
      assert.nestedPropertyVal(users, 'description', 'userid');
    });

    after('clean file', () => {
      fs.unlinkSync('test/convert/temp/array.json');
    });
  });
});
