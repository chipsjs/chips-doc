const { assert } = require('chai');

// eslint-disable-next-line prefer-const
let { request } = require('../../lib');
const { TaskFlow } = require('../../index');
const api_flow = require('./api_flow.json');
const swagger = require('./swagger.json');
const hook = require('../tools/hook');
const Router = require('../tools/router');

// here is the schema's link about string: https://json-schema.org/understanding-json-schema/reference/string.html#format
describe('flow mock', () => {
  before('start mock server', () => {
    hook(request, Router.mock);
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

    describe('flow_2 | query specific & response validator', () => {
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

    describe('api5 | path is in the middle of url', () => {
      let report_queue;

      before('mock', async () => {
        const task_flow = new TaskFlow('temp');
        await task_flow.execute(swagger, api_flow.flow_10);
        report_queue = task_flow.outputReport();
      });

      it('should have right output', () => {
        assert.strictEqual(report_queue.length, 2);
        assert.nestedPropertyVal(report_queue[0], 'api_info_name', api_flow.flow_10.flow[0]);
        assert.nestedPropertyVal(report_queue[1], 'api_info_name', api_flow.flow_10.flow[0]);
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

  describe('response validate error', () => {
    let report_queue;
    let fail_queue;

    before('mock', async () => {
      const task_flow = new TaskFlow('temp');
      await task_flow.execute(swagger, api_flow.flow_11);
      report_queue = task_flow.outputReport();
      fail_queue = task_flow.outputFailedReport()
    });

    it('should have right output', () => {
      assert.strictEqual(report_queue.length, 0);
      assert.strictEqual(fail_queue.length, 1);
      assert.strictEqual(fail_queue[0].api_info_name, api_flow.flow_11.flow[0]);
      assert.strictEqual(fail_queue[0].message, 'instance.success is not of a type(s) number');
    });
  })

  describe('controller', () => {
    describe('ignore', () => {
      let report_queue;

      before('mock', async () => {
        const task_flow = new TaskFlow('temp');
        await task_flow.execute(swagger, api_flow.flow_12);
        report_queue = task_flow.outputReport();
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
        const task_flow = new TaskFlow('temp');
        await task_flow.execute(swagger, api_flow.flow_14);
        report_queue = task_flow.outputReport();
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
        const task_flow = new TaskFlow('temp');
        await task_flow.execute(swagger, api_flow.flow_15);
        report_queue = task_flow.outputReport();
      });

      it('should have right output', () => {
        assert.strictEqual(report_queue.length, 4);
        assert.strictEqual(report_queue[0].api_info_name, api_flow.flow_15.flow[0]);
        assert.strictEqual(report_queue[1].api_info_name, api_flow.flow_15.flow[0]);
        assert.strictEqual(report_queue[2].api_info_name, api_flow.flow_15.flow[1]);
        assert.strictEqual(report_queue[3].api_info_name, api_flow.flow_15.flow[1]);
      });
    });
  })

  describe('api can call multi times | has @id', () => {
    let report_queue;

    before('mock', async () => {
      const task_flow = new TaskFlow('temp');
      await task_flow.execute(swagger, api_flow.flow_13);
      report_queue = task_flow.outputReport();
    });

    it('should have right output', () => {
      assert.strictEqual(report_queue.length, 4);
      assert.strictEqual(report_queue[0].url, '/api1');
      assert.strictEqual(report_queue[1].url, '/api1');
      assert.strictEqual(report_queue[2].url, '/api1');
      assert.strictEqual(report_queue[3].url, '/api1');
    });
  });

  describe('unknown extension', () => {
    let report_queue;
    let fail_queue;

    before('mock', async () => {
      const task_flow = new TaskFlow('temp');
      await task_flow.execute(swagger, api_flow.flow_16);
      report_queue = task_flow.outputReport();
      fail_queue = task_flow.outputFailedReport();
    });

    it('should have right output', () => {
      assert.strictEqual(report_queue.length, 0);
      assert.strictEqual(fail_queue.length, 1);
      assert.strictEqual(fail_queue[0].api_info_name, api_flow.flow_16.flow[0]);
      assert.strictEqual(fail_queue[0].message, 'no support this extension: unknown');
    });
  })

  describe('report', () => {
    describe('read && desctory report', () => {
      let before_destory_report;
      let after_destory_report;

      before('mock', async () => {
        const task_flow = new TaskFlow('temp');
        await task_flow.execute(swagger, api_flow.flow_1);
        before_destory_report = task_flow.readReport();
        task_flow.destoryReport();
        after_destory_report = task_flow.readReport();
      });

      it('should have right output', () => {
        assert.isDefined(before_destory_report);
        assert.strictEqual(after_destory_report, '');
      });
    });
  })

  describe('swagger fake', () => {
    describe('query schema no exist', () => {
      let report_queue;

      before('mock', async () => {
        const task_flow = new TaskFlow('temp');
        await task_flow.execute(swagger, api_flow.flow_17);
        report_queue = task_flow.outputReport();
      });

      it('should have right output', () => {
        assert.strictEqual(report_queue.length, 2);
        assert.nestedPropertyVal(report_queue[0], 'api_info_name', api_flow.flow_17.flow[0]);
        assert.nestedPropertyVal(report_queue[1], 'api_info_name', api_flow.flow_17.flow[0]);
        assert.nestedPropertyVal(report_queue[1], 'response.status', 200);
        assert.nestedPropertyVal(report_queue[1], 'response.data.success', false);
      });
    });
  });

  describe('path context data', () => {
    let report_queue;

    before('mock', async () => {
      const task_flow = new TaskFlow('temp');
      await task_flow.execute(swagger, api_flow.flow_18);
      report_queue = task_flow.outputReport();
    });

    it('should have right output', () => {
      assert.strictEqual(report_queue.length, 2);
      assert.nestedPropertyVal(report_queue[0], 'api_info_name', api_flow.flow_18.flow[0]);
      assert.nestedPropertyVal(report_queue[0], 'url', '/api3/C');
      assert.nestedPropertyVal(report_queue[1], 'api_info_name', api_flow.flow_18.flow[0]);
      assert.nestedPropertyVal(report_queue[1], 'response.status', 200);
      assert.nestedPropertyVal(report_queue[1], 'response.data.success', true);
    });
  });

  // context merge specific

  // TODO, context 是递归的
  // TODO, context 在response中指定
  // after('stop mock server', () => {
  //   mock_server.shutdown();
  // });
});
