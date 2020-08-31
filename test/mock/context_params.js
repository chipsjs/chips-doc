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

describe('context params', () => {
  before('start mock server', () => {
    helper.mockServerStart();
  });

  describe('context updated by response', () => {
    let report_queue;

    before('mock', async () => {
      const { report } = await TaskFlow.run('temp', {
        swaggers,
        api_flow: api_flow.flow_25
      });
      report_queue = report;
    });

    it('should have right output', () => {
      assert.strictEqual(report_queue.length, 4);
      assert.nestedPropertyVal(report_queue[0], 'api_info_name', api_flow.flow_25.flow[0]);
      assert.nestedPropertyVal(report_queue[0], 'data.param.a', 'kkk');
      assert.nestedPropertyVal(report_queue[1], 'response.data.param.a', 'a');
      assert.nestedPropertyVal(report_queue[2], 'api_info_name', api_flow.flow_25.flow[1]);
      assert.nestedPropertyVal(report_queue[2], 'data.param.a', 'a');
      assert.nestedPropertyVal(report_queue[3], 'response.data.success', true);
    });
  });

  describe('context params undefined and updated by request', () => {
    let report_queue;

    before('mock', async () => {
      const { report } = await TaskFlow.run('temp', {
        swaggers,
        api_flow: api_flow.flow_24
      });
      report_queue = report;
    });

    it('should have right output', () => {
      assert.strictEqual(report_queue.length, 4);
      assert.nestedPropertyVal(report_queue[0], 'api_info_name', api_flow.flow_24.flow[0]);
      assert.nestedPropertyVal(report_queue[0], 'data.param.a', 'a');
      assert.nestedPropertyVal(report_queue[1], 'response.data.success', false);
      assert.nestedPropertyVal(report_queue[2], 'api_info_name', api_flow.flow_24.flow[1]);
      assert.nestedPropertyVal(report_queue[2], 'data.param.a', 'a');
      assert.nestedPropertyVal(report_queue[3], 'response.data.success', true);
    });
  });

  describe('context dont have scope, using default scope', () => {
    let report_queue;

    before('mock', async () => {
      const { report } = await TaskFlow.run('temp', {
        swaggers,
        api_flow: api_flow.flow_23
      });
      report_queue = report;
    });

    it('should have right output', () => {
      assert.strictEqual(report_queue.length, 2);
      assert.nestedPropertyVal(report_queue[0], 'api_info_name', api_flow.flow_23.flow[0]);
      assert.nestedPropertyVal(report_queue[0], 'data.param.a', 'b');
      assert.nestedPropertyVal(report_queue[1], 'response.data.success', true);
    });
  });

  describe('context overwrited by specific', () => {
    let report_queue;

    before('mock', async () => {
      const { report } = await TaskFlow.run('temp', {
        swaggers,
        api_flow: api_flow.flow_22
      });
      report_queue = report;
    });

    it('should have right output', () => {
      assert.strictEqual(report_queue.length, 2);
      assert.nestedPropertyVal(report_queue[0], 'api_info_name', api_flow.flow_22.flow[0]);
      assert.nestedPropertyVal(report_queue[0], 'data.param.a', 'c');
      assert.nestedPropertyVal(report_queue[1], 'response.data.success', false);
    });
  });

  describe('context params is key.key.', () => {
    let report_queue;

    before('mock', async () => {
      const { report } = await TaskFlow.run('temp', {
        swaggers,
        api_flow: api_flow.flow_21
      });
      report_queue = report;
    });

    it('should have right output', () => {
      assert.strictEqual(report_queue.length, 2);
      assert.nestedPropertyVal(report_queue[0], 'api_info_name', api_flow.flow_21.flow[0]);
      assert.nestedPropertyVal(report_queue[0], 'data.param.a', api_flow.flow_21.context.params.id);
      assert.nestedPropertyVal(report_queue[1], 'response.data.success', true);
    });
  });

  // eslint-disable-next-line no-template-curly-in-string
  describe('suport query exist "${xxx}" as variable', () => {
    let report_queue;

    before('mock', async () => {
      const report = await TaskFlow.run('temp', {
        swaggers,
        api_flow: api_flow.flow_27
      });
      report_queue = report.report;
    });

    it('should have right output', () => {
      assert.strictEqual(report_queue.length, 2);
      assert.nestedPropertyVal(report_queue[0], 'api_info_name', api_flow.flow_27.flow[0]);
      assert.nestedPropertyVal(report_queue[0], 'params.param', 'id:1,name:x');
      assert.nestedPropertyVal(report_queue[1], 'response.data', true);
    });
  });

  // eslint-disable-next-line no-template-curly-in-string
  describe('suport body exist "${xxx}" as variable', () => {
    let report_queue;

    before('mock', async () => {
      const report = await TaskFlow.run('temp', {
        swaggers,
        api_flow: api_flow.flow_26
      });
      report_queue = report.report;
    });

    it('should have right output', () => {
      assert.strictEqual(report_queue.length, 2);
      assert.nestedPropertyVal(report_queue[0], 'api_info_name', api_flow.flow_26.flow[0]);
      assert.nestedPropertyVal(report_queue[0], 'data.param', 'id:1,name:x');
      assert.nestedPropertyVal(report_queue[1], 'response.data', true);
    });
  });

  after('stop mock server', () => {
    helper.mockServerRestore();
  });
});
