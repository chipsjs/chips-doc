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
    describe('api1 | query auto fake & response validator', () => {
      let report_queue;

      before('mock', async () => {
        const task_flow = new TaskFlow('temp');
        await task_flow.execute(swagger, api_flow.flow_1);
        report_queue = task_flow.outputReport();
      });

      it('should have right output', () => {
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
        await task_flow.execute(swagger, api_flow.flow_2);
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
      let report_queue;

      before('mock', async () => {
        const task_flow = new TaskFlow('temp');
        await task_flow.execute(swagger, api_flow.flow_3);
        report_queue = task_flow.outputReport();
      });

      it('should have right output', () => {
        assert.strictEqual(report_queue.length, 2);
        assert.nestedPropertyVal(report_queue[0], 'api_info_name', api_flow.flow_3.flow[0]);
        assert.nestedPropertyVal(report_queue[1], 'api_info_name', api_flow.flow_3.flow[0]);
        assert.nestedPropertyVal(report_queue[1], 'response.status', 200);
        assert.nestedPropertyVal(report_queue[1], 'response.data.success', true);
      });
    });

    describe('api2 | body specific & response validator', () => {
      let report_queue;

      before('mock', async () => {
        const task_flow = new TaskFlow('temp');
        await task_flow.execute(swagger, api_flow.flow_4);
        report_queue = task_flow.outputReport();
      });

      it('should have right output', () => {
        assert.strictEqual(report_queue.length, 2);
        assert.nestedPropertyVal(report_queue[0], 'api_info_name', api_flow.flow_4.flow[0]);
        assert.nestedPropertyVal(report_queue[1], 'api_info_name', api_flow.flow_4.flow[0]);
        assert.nestedPropertyVal(report_queue[1], 'response.status', 200);
        assert.nestedPropertyVal(report_queue[1], 'response.data.success', false);
      });
    });

    describe('api3 | path auto fake & response validator', () => {
      let report_queue;

      before('mock', async () => {
        const task_flow = new TaskFlow('temp');
        await task_flow.execute(swagger, api_flow.flow_5);
        report_queue = task_flow.outputReport();
      });

      it('should have right output', () => {
        assert.strictEqual(report_queue.length, 2);
        assert.nestedPropertyVal(report_queue[0], 'api_info_name', api_flow.flow_5.flow[0]);
        assert.nestedPropertyVal(report_queue[1], 'api_info_name', api_flow.flow_5.flow[0]);
        assert.nestedPropertyVal(report_queue[1], 'response.status', 200);
        assert.nestedPropertyVal(report_queue[1], 'response.data.success', true);
      });
    });

    describe('api3 | path specific & response validator', () => {
      let report_queue;

      before('mock', async () => {
        const task_flow = new TaskFlow('temp');
        await task_flow.execute(swagger, api_flow.flow_6);
        report_queue = task_flow.outputReport();
      });

      it('should have right output', () => {
        assert.strictEqual(report_queue.length, 2);
        assert.nestedPropertyVal(report_queue[0], 'api_info_name', api_flow.flow_6.flow[0]);
        assert.nestedPropertyVal(report_queue[1], 'api_info_name', api_flow.flow_6.flow[0]);
        assert.nestedPropertyVal(report_queue[1], 'response.status', 200);
        assert.nestedPropertyVal(report_queue[1], 'response.data.success', true);
      });
    });
  });

  describe('same api call multi times', () => {
    let report_queue;

    before('mock', async () => {
      const task_flow = new TaskFlow('temp');
      await task_flow.execute(swagger, api_flow.flow_7);
      report_queue = task_flow.outputReport();
    });

    it('should have right output', () => {
      assert.strictEqual(report_queue.length, 4);
      assert.nestedPropertyVal(report_queue[0], 'api_info_name', api_flow.flow_7.flow[0]);
      assert.nestedPropertyVal(report_queue[1], 'api_info_name', api_flow.flow_7.flow[0]);
      assert.nestedPropertyVal(report_queue[2], 'api_info_name', api_flow.flow_7.flow[1]);
      assert.nestedPropertyVal(report_queue[3], 'api_info_name', api_flow.flow_7.flow[1]);

      assert.nestedPropertyVal(report_queue[1], 'response.status', 200);
      assert.nestedPropertyVal(report_queue[1], 'response.data.success', true);
      assert.nestedPropertyVal(report_queue[3], 'response.status', 200);
      assert.nestedPropertyVal(report_queue[3], 'response.data.success', false);
    });
  });

  describe('multi api mock', () => {
    let report_queue;

    before('mock', async () => {
      const task_flow = new TaskFlow('temp');
      await task_flow.execute(swagger, api_flow.flow_8);
      report_queue = task_flow.outputReport();
    });

    it('should have right output', () => {
      assert.strictEqual(report_queue.length, 4);
      assert.nestedPropertyVal(report_queue[0], 'api_info_name', api_flow.flow_8.flow[0]);
      assert.nestedPropertyVal(report_queue[1], 'api_info_name', api_flow.flow_8.flow[0]);
      assert.nestedPropertyVal(report_queue[2], 'api_info_name', api_flow.flow_8.flow[1]);
      assert.nestedPropertyVal(report_queue[3], 'api_info_name', api_flow.flow_8.flow[1]);

      assert.nestedPropertyVal(report_queue[1], 'response.status', 200);
      assert.nestedPropertyVal(report_queue[1], 'response.data.success', true);
      assert.nestedPropertyVal(report_queue[3], 'response.status', 200);
      assert.nestedPropertyVal(report_queue[3], 'response.data.success', true);
    });
  });

  describe('context api mock', () => {
    let report_queue;

    before('mock', async () => {
      const task_flow = new TaskFlow('temp');
      await task_flow.execute(swagger, api_flow.flow_9);
      report_queue = task_flow.outputReport();
    });

    it('should have right output', () => {
      assert.strictEqual(report_queue.length, 4);
      assert.nestedPropertyVal(report_queue[0], 'api_info_name', api_flow.flow_9.flow[0]);
      assert.nestedPropertyVal(report_queue[1], 'api_info_name', api_flow.flow_9.flow[0]);
      assert.nestedPropertyVal(report_queue[2], 'api_info_name', api_flow.flow_9.flow[1]);
      assert.nestedPropertyVal(report_queue[3], 'api_info_name', api_flow.flow_9.flow[1]);

      assert.nestedPropertyVal(report_queue[1], 'response.status', 200);
      assert.nestedPropertyVal(report_queue[1], 'response.data.success', true);
      assert.nestedPropertyVal(report_queue[3], 'response.status', 200);
      assert.nestedPropertyVal(report_queue[3], 'response.data.success', true);
    });
  });

  // TODO, context 是递归的

  // TODO, path a/:userID/B

  after('stop mock server', () => {
    mock_server.shutdown();
  });
});
