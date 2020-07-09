const _ = require('lodash');
const { loop } = require('../../../lib');

const provider_type = 'Controller';

class Controller {
  static isIgnore(ctx) {
    return _.get(ctx, [ctx.current_task_id, provider_type, 'ignore'], false);
  }

  static get type() {
    return provider_type;
  }

  static async run(ctx, next) {
    if (!Controller.isIgnore(ctx)) {
      await next();
      await Controller.process(ctx);
    } else {
      // TODO, log ignore task to report
    }
  }

  static async process(ctx) {
    const params = _.get(ctx, [ctx.current_task_id, provider_type, 'params'], {});

    await loop.forEach(Object.entries(params).values(), ([control_case, control_info]) => {
      switch (control_case) {
        case 'ignore':
          Controller.ignoreCase(ctx, control_info);
          break;
        default:
          // do nothing; you can add new controller case here
          break;
      }
    })
  }

  static async ignoreCase(ctx, control_info) {
    const { task_id: dest_task_id, condition } = control_info;

    const http_response = _.get(ctx, [ctx.current_task_id, 'result', 'response', 'data'], {});

    const exist_no_match = Object.entries(condition).find(
      ([key, value]) => {
        if (_.has(http_response, key)) {
          return _.get(http_response, key) !== value
        }
        return false;
      }
    );
    // TODO, dest task id support array
    if (!exist_no_match) {
      _.set(ctx, [dest_task_id, provider_type, 'ignore'], true);
    }
  }
}

module.exports = Controller;
