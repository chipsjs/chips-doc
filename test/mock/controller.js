const { assert } = require('chai');
const sinon = require('sinon');

const { TaskFlow } = require('../../index');
const api_flow = require('./api_flow');
const helper = require('../tools/helper');
const v1_swagger = require('./v1_swagger.json');
const v2_swagger = require('./v2_swagger.json');

const swaggers = {
  v1: v1_swagger,
  v2: v2_swagger
}

// here is the schema's link about string: https://json-schema.org/understanding-json-schema/reference/string.html#format
describe('controller', () => {
  before('start mock server', () => {
    helper.mockServerStart();
  });

  describe('ignore', () => {
    let report_queue;

    before('mock', async () => {
      const { report } = await TaskFlow.run('temp', {
        swaggers,
        api_flow: api_flow.flow_12
      });
      report_queue = report;
    });

    it('should have right output', () => {
      assert.strictEqual(report_queue.length, 2);
      assert.strictEqual(report_queue[0].api_info_name, api_flow.flow_12.flow[0]);
      assert.strictEqual(report_queue[1].api_info_name, api_flow.flow_12.flow[0]);
    });
  });

  describe('no ignore', () => {
    let report_queue;

    before('mock', async () => {
      const { report } = await TaskFlow.run('temp', {
        swaggers,
        api_flow: api_flow.flow_14
      });
      report_queue = report;
    });

    it('should have right output', () => {
      assert.strictEqual(report_queue.length, 4);
      assert.strictEqual(report_queue[0].api_info_name, api_flow.flow_14.flow[0]);
      assert.strictEqual(report_queue[1].api_info_name, api_flow.flow_14.flow[0]);
      assert.strictEqual(report_queue[2].api_info_name, api_flow.flow_14.flow[1]);
      assert.strictEqual(report_queue[3].api_info_name, api_flow.flow_14.flow[1]);
    });
  });

  describe('useless control case', () => {
    let report_queue;

    before('mock', async () => {
      const { report } = await TaskFlow.run('temp', {
        swaggers,
        api_flow: api_flow.flow_15
      });
      report_queue = report;
    });

    it('should have right output', () => {
      assert.strictEqual(report_queue.length, 4);
      assert.strictEqual(report_queue[0].api_info_name, api_flow.flow_15.flow[0]);
      assert.strictEqual(report_queue[1].api_info_name, api_flow.flow_15.flow[0]);
      assert.strictEqual(report_queue[2].api_info_name, api_flow.flow_15.flow[1]);
      assert.strictEqual(report_queue[3].api_info_name, api_flow.flow_15.flow[1]);
    });
  });

  // describe('four apis in flow', () => {
  //   let report_queue;

  //   before('mock', async () => {
  //     const { report } = await TaskFlow.run('temp', {
  //       swaggers,
  //       api_flow: api_flow.flow_19
  //     });
  //     report_queue = report;
  //   });

  //   it('should have right output', () => {
  //     assert.strictEqual(report_queue.length, 4);
  //     assert.strictEqual(report_queue[0].api_info_name, api_flow.flow_15.flow[0]);
  //     assert.strictEqual(report_queue[1].api_info_name, api_flow.flow_15.flow[0]);
  //     assert.strictEqual(report_queue[2].api_info_name, api_flow.flow_15.flow[1]);
  //     assert.strictEqual(report_queue[3].api_info_name, api_flow.flow_15.flow[1]);
  //   });
  // });

  describe('after function controllered by response', () => {
    let report_queue;
    let callFunction;

    before('spy function', () => {
      callFunction = sinon.spy(helper, 'callFunction');
    });

    before('mock', async () => {
      const { report } = await TaskFlow.run('temp', {
        swaggers,
        api_flow: api_flow.controller_after_function_response
      });
      report_queue = report;
    });

    after(() => {
      callFunction.restore();
    });

    it('should call helper.callfunction', () => {
      sinon.assert.called(callFunction);
    });

    it('should have right output', () => {
      assert.strictEqual(report_queue.length, 2);
      assert.nestedPropertyVal(report_queue[0], 'api_info_name', api_flow.controller_after_function_response.flow[0]);
      assert.nestedPropertyVal(report_queue[1], 'api_info_name', api_flow.controller_after_function_response.flow[0]);
      assert.nestedPropertyVal(report_queue[1], 'response.status', 200);
      assert.nestedPropertyVal(report_queue[1], 'response.data.success', true);
    });
  });

  describe('after function controllered by context', () => {
    let report_queue;
    let callFunction;

    before('spy function', () => {
      callFunction = sinon.spy(helper, 'callFunction');
    });

    before('mock', async () => {
      const { report } = await TaskFlow.run('temp', {
        swaggers,
        api_flow: api_flow.controller_after_function_context
      });
      report_queue = report;
    });

    after(() => {
      callFunction.restore();
    });

    it('should call helper.callfunction', () => {
      sinon.assert.called(callFunction);
    });

    it('should have right output', () => {
      assert.strictEqual(report_queue.length, 2);
      assert.nestedPropertyVal(report_queue[0], 'api_info_name', api_flow.controller_after_function_context.flow[0]);
      assert.nestedPropertyVal(report_queue[1], 'api_info_name', api_flow.controller_after_function_context.flow[0]);
      assert.nestedPropertyVal(report_queue[1], 'response.status', 200);
      assert.nestedPropertyVal(report_queue[1], 'response.data.success', true);
    });
  });

  describe('before function', () => {
    let report_queue;
    let callFunction;

    before('spy function', () => {
      callFunction = sinon.spy(helper, 'callFunction');
    });

    before('mock', async () => {
      const { report } = await TaskFlow.run('temp', {
        swaggers,
        api_flow: api_flow.controller_before_function
      });
      report_queue = report;
    });

    after(() => {
      callFunction.restore();
    });

    it('should call helper.callfunction', () => {
      sinon.assert.called(callFunction);
    });

    it('should have right output', () => {
      assert.strictEqual(report_queue.length, 2);
      assert.nestedPropertyVal(report_queue[0], 'api_info_name', api_flow.controller_before_function.flow[0]);
      assert.nestedPropertyVal(report_queue[1], 'api_info_name', api_flow.controller_before_function.flow[0]);
      assert.nestedPropertyVal(report_queue[1], 'response.status', 200);
      assert.nestedPropertyVal(report_queue[1], 'response.data.success', true);
    });
  });

  after('stop mock server', () => {
    helper.mockServerRestore();
  });
});
