const { assert } = require('chai');

const { FlowManager } = require('../../index');
const api_flow = require('./api_flow');
const helper = require('../tools/helper');
const v1_swagger = require('./v1_swagger.json');
const v2_swagger = require('./v2_swagger.json');

const swaggers = {
  v1: v1_swagger,
  v2: v2_swagger
}

describe('flowmanager', () => {
  before('start mock server', () => {
    helper.mockServerStart();
  });

  describe('run | jump to next flow', () => {
    let report_queue = [];
    let context;

    before('mock', async () => {
      const { reports, flows_context } = await FlowManager.run({
        user_id: 'temp',
        template_flows: api_flow,
        swaggers,
        flow_name: 'controller_dest_flow'
      });
      report_queue = reports;
      context = flows_context;
    });

    it('should have jump to next flow', () => {
      assert.strictEqual(report_queue.length, 2);
      assert.nestedPropertyVal(report_queue[0], 'report.0.api_info_name', api_flow.controller_dest_flow.flow[0]);
      assert.nestedPropertyVal(report_queue[0], 'report.1.api_info_name', api_flow.controller_dest_flow.flow[0]);
      assert.nestedPropertyVal(report_queue[1], 'report.0.api_info_name', api_flow.controller_dest_flow_2.flow[0]);
      assert.nestedPropertyVal(report_queue[1], 'report.1.api_info_name', api_flow.controller_dest_flow_2.flow[0]);
    });

    it('should merge context', () => {
      assert.nestedPropertyVal(report_queue[1], 'report.0.data.success', true);
    });

    it('should update context', () => {
      assert.nestedPropertyVal(context, 'success', false);
    })
  });

  after('stop mock server', () => {
    helper.mockServerRestore();
  });
});
