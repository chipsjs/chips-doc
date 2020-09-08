const { assert } = require('chai');
const { TaskFlow } = require('../../index');
const api_flow = require('./api_flow');
const v1_swagger = require('./v1_swagger.json');
const v2_swagger = require('./v2_swagger.json');
const helper = require('../tools/helper');

const swaggers = {
  v1: v1_swagger,
  v2: v2_swagger
}

describe('support variable', () => {
  before('start mock server', () => {
    helper.mockServerStart();
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

  describe('support exist "[${}, ${}]" as variable', () => {
    let report_queue;

    before('mock', async () => {
      const report = await TaskFlow.run('temp', {
        swaggers,
        api_flow: api_flow.flow_28
      });
      report_queue = report.report;
    });

    it('should have right output', () => {
      assert.strictEqual(report_queue.length, 2);
      assert.nestedPropertyVal(report_queue[0], 'api_info_name', api_flow.flow_28.flow[0]);
      assert.nestedPropertyVal(report_queue[0], 'data.ids.0', '0');
      assert.nestedPropertyVal(report_queue[0], 'data.ids.1', '1');
      assert.nestedPropertyVal(report_queue[1], 'response.data', true);
    });
  });

  after('stop mock server', () => {
    helper.mockServerRestore();
  });
})
