const { assert } = require('chai');

const Fake = require('../middleware/fake/fake');
const test_json = require('./test_api_doc.json');
const test_flow = require('./test_api_flow.json');

describe('fake pai doc to generate test case', () => {
  let test_cases = {};

  before('initialize', () => {
    Fake.initialize({
      log_module: console,
      temp_test_case_path: 'test/temp/normal_test_case',
      special_test_case_path: 'test/temp/special_test_case',
    });
  });

  describe('date type | basic', () => {
  });

  // here is the schema's link about string: https://json-schema.org/understanding-json-schema/reference/string.html#format
  describe('date type | string', () => {
    before('load api doc', async () => {
      // const string_test_json = test_json.string_types;
      await Fake.getInstance().loadApiDoc(test_json);
      test_cases = await Fake.getInstance().outputTestCaseFlow(test_flow.single_2);
    })

    it('should correct test case', () => {
      assert.strictEqual(test_cases.length, 1);
      // assert.strictEqual(test_cases);
    });

    after('clean env', async () => {
      // await Fake.getInstance().clean();
    });
  });

  // 2 describe('special case || have public param', () => {
  //
  // });

  //  1 "required": [ "productId", "productName", "price" ]


  // flow 多个;
});
