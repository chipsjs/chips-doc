const { assert } = require('chai');
const { TaskFlow } = require('../../index');
const api_flow = require('./api_flow.json');
const v1_swagger = require('./v1_swagger.json');
const v2_swagger = require('./v2_swagger.json');
const helper = require('../tools/helper');

const swaggers = {
  v1: v1_swagger,
  v2: v2_swagger
}

// here is the schema's link about string: https://json-schema.org/understanding-json-schema/reference/string.html#format
describe('flow mock', () => {
  before('start mock server', () => {
    helper.mockServerStart();
  });

  describe('api use swagger v2', () => {
    let report_queue;

    before('mock', async () => {
      const { report } = await TaskFlow.run('temp', {
        swaggers,
        api_flow: api_flow.flow_20
      });
      report_queue = report;
    });

    it('should have right output', () => {
      assert.strictEqual(report_queue.length, 2);
      assert.nestedPropertyVal(report_queue[0], 'api_info_name', api_flow.flow_1.flow[0]);
      assert.nestedPropertyVal(report_queue[1], 'api_info_name', api_flow.flow_1.flow[0]);
      assert.nestedPropertyVal(report_queue[1], 'response.status', 200);
      assert.nestedPropertyVal(report_queue[1], 'response.data.success', false);
    });
  })

  after('stop mock server', () => {
    helper.mockServerRestore();
  });
});
