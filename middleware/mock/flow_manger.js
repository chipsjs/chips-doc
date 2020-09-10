const _ = require('lodash');
const TaskFlow = require('./task_flow');
const { looper } = require('../../lib');
// TODO,  add test

class FlowManager {
  constructor({
    user_id, template_flows, swaggers, headers, flows_context
  }) {
    this.flows_context = _.cloneDeep(flows_context);
    this.reports = [];
    this.user_id = user_id;
    this.template_flows = template_flows; // do not clone deep because this object is big
    this.swaggers = swaggers;// do not clone deep because this object is big
    this.headers = _.cloneDeep(headers);
    // this.flow_name_arr = _.cloneDeep(flow_name_arr);
  }

  /**
   * only support flow chain
   *
   * @static
   * @param {object} options - options
   * @param {string} options.user_id - user name
   * @param {object} options.template_flows - template_flows
   * @param {object} options.swaggers - swaggers
   * @param {object} options.headers - headers
   * @param {object} options.flow_name - flow_name
   * @param {object} options.flows_context - context
   * @returns {object} - flows context
   * @memberof FlowManager
   */
  static async run(options) {
    const instance = new FlowManager(options);
    const { flow_name } = options;
    if (typeof flow_name === 'string') {
      await instance.excute(flow_name);
    } else if (Array.isArray(flow_name)) {
      looper.forEach(flow_name, async (single_flow_name) => {
        await instance.excute(single_flow_name);
      });
    }

    return {
      flows_context: instance.flows_context,
      reports: instance.reports
    }
  }

  /**
   * run flow array, todo
   *
   * @static
   * @param {object} options - options
   * @memberof FlowManager
   */
  static async multiRun() {
    // await looper.map(this.flow_name_arr, async (flow_name) => {
    //   reports.push({ report });
    // });

    // return reports;
  }

  async excute(flow_name) {
    const template_flow = _.get(this.template_flows, flow_name, {});
    const flow = _.cloneDeep(template_flow);
    _.set(flow, ['context', 'params'], this.mergeContext(flow));

    const { report, fail_report, context } = await TaskFlow.run(this.user_id, {
      swaggers: this.swaggers,
      api_flow: flow,
      headers: this.headers
    });

    const context_params = _.get(context, ['context', 'params'], {});
    this.updateContext(context_params);

    if (fail_report.length !== 0) {
      this.reports.push({ report, fail_report });
      // throw new Error('task flows excute fail');
    } else {
      this.reports.push({ report });
    }

    if (_.has(context, 'next_flow_id')) {
      const next_flow_id = _.get(context, ['next_flow_id'], '');
      await this.excute(next_flow_id);
    }
  }

  /**
   *
   *
   * @param {object} flow - current flow
   * @param {object} flows_context - flows context
   * @returns {object} - cur_context
   * @memberof FlowManager
   */
  mergeContext(flow) {
    let base_context = _.get(flow, ['context', 'params'], {});

    if (Array.isArray(base_context)) {
      base_context = base_context.reduce((result, key) => {
        // eslint-disable-next-line no-param-reassign
        result[key] = null;
        return result;
      }, {});
    }

    const cur_context = _.merge(
      {}, base_context, _.pick(this.flows_context, Object.keys(base_context))
    );

    return cur_context;
  }

  async updateContext(context_params) {
    _.merge(this.flows_context, context_params);
  }
}

module.exports = FlowManager;
