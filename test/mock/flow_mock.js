const mock_server = require('cola-mock-server');
const { assert } = require('mocha');

const { TaskFlow } = require('../../index');
const api_flow = require('./api_flow.json');
const swagger = require('./swagger.json');

// here is the schema's link about string: https://json-schema.org/understanding-json-schema/reference/string.html#format
describe('flow mock', () => {
  let report_queue;

  before('start mock server', () => {
    mock_server.start();
  });

  describe('signle api mock', () => {
    before('api1', async () => {
      const task_flow = new TaskFlow('temp');
      await task_flow.excute(swagger, api_flow.flow_1);
      report_queue = task_flow.outputReport();
    });

    it('should have right output', () => {
      assert.strictEqual(report_queue.length, 2);
      assert.nestedPropertyVal(report_queue[0], 'url', '/api1');
      assert.nestedPropertyVal(report_queue[0], 'method_type', 'get');
      assert.nestedPropertyVal(report_queue[1], 'url', '/api1');
      assert.nestedPropertyVal(report_queue[1], 'method_type', 'get');
      assert.nestedPropertyVal(report_queue[1], 'response.status', 200);
      assert.nestedPropertyVal(report_queue[1], 'response.data.success', true);
    });
  });
});
