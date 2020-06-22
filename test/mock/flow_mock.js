const mock_server = require('cola-mock-server');
const { assert } = require('chai');

const { TaskFlow } = require('../../index');
const api_flow = require('./api_flow.json');
const swagger = require('./swagger.json');

// here is the schema's link about string: https://json-schema.org/understanding-json-schema/reference/string.html#format
describe('flow mock', () => {
  before('start mock server', () => {
    mock_server.start();
  });

  describe('signle api mock', () => {
    // api1 when key.length >= 2 && < 10, api server will return true, or not return false
    describe('api1 | query auto fake & response validator', () => {
      let report_queue;

      before('mock', async () => {
        const task_flow = new TaskFlow('temp');
        await task_flow.excute(swagger, api_flow.flow_1);
        report_queue = task_flow.outputReport();
      });

      it('should have right output', async () => {
        assert.strictEqual(report_queue.length, 2);
        assert.nestedPropertyVal(report_queue[0], 'api_info_name', api_flow.flow_1.flow[0]);
        assert.nestedPropertyVal(report_queue[1], 'api_info_name', api_flow.flow_1.flow[0]);
        assert.nestedPropertyVal(report_queue[1], 'response.status', 200);
        assert.nestedPropertyVal(report_queue[1], 'response.data.success', true);
      });
    })

    describe('api1 | query specific & response validator', () => {
      let report_queue;

      before('mock', async () => {
        const task_flow = new TaskFlow('temp');
        await task_flow.excute(swagger, api_flow.flow_2);
        report_queue = task_flow.outputReport();
      });

      it('should have right output', () => {
        assert.strictEqual(report_queue.length, 2);
        assert.nestedPropertyVal(report_queue[0], 'api_info_name', api_flow.flow_1.flow[0]);
        assert.nestedPropertyVal(report_queue[1], 'api_info_name', api_flow.flow_1.flow[0]);
        assert.nestedPropertyVal(report_queue[1], 'response.status', 200);
        assert.nestedPropertyVal(report_queue[1], 'response.data.success', false);
      });
    });

    describe('api2 | body auto fake & response validator', () => {
    });

    describe('api2 | body specific & response validator', () => {
    });

    describe('api3 | path auto fake & response validator', () => {
    });

    describe('api3 | path specific & response validator', () => {
    });
  });

  // describe('same api call multi', () => {

  // });

  after('stop mock server', () => {
    mock_server.shutdown();
  });
});
