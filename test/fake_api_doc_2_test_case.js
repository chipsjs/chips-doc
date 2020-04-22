const { assert } = require('chai');

const Loader = require('../middleware/fake/loader');

describe('fake pai doc to generate test case', () => {
  before('initialize', () => {
    Loader.initialize({
      log_module: console,
      temp_test_case_path: 'test/temp/normal_test_case',
      special_test_case_path: 'test/temp/special_test_case',
    });
  });

  describe('normal case', () => {
    const api_doc = {
      getUser: {
        method_type: 'get',
        url: '{base_url}/users/:otherUserID',
        request: {
          path: {
            otherUserID: {
              type: 'string'
            }
          }
        }
      },
    }

    const api_doc_json = {

    };

    const api_flow = {

    };
  });

  describe('special case || have public param', () => {

  });
});
