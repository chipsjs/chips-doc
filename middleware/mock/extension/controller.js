const _ = require('lodash');
const { loop } = require('../../../lib');
const BaseExtension = require('./base_extension');

class Controller extends BaseExtension {
  static isIgnore(ctx) {
    return _.get(ctx, ['public', ctx.task_id, this.type, 'ignore'], false);
  }

  static isDest(ctx) {
    const next_task_id = _.get(ctx, ['public', 'next_task_id'], ctx.task_id);
    return next_task_id === ctx.task_id;
  }

  static async run(ctx, next) {
    if (!Controller.isIgnore(ctx) && Controller.isDest(ctx)) {
      await next();
      await Controller.setController(ctx);
    } else {
      // TODO, log ignore task to report
    }
  }

  static async setController(ctx) {
    const params = _.get(ctx, [this.type, 'params'], {});

    await loop.forEach(Object.entries(params).values(), ([control_case, control_info]) => {
      switch (control_case) {
        case 'ignore':
          Controller.ignoreCase(ctx, control_info);
          break;
        case 'dest':
          Controller.destCase(ctx, control_info);
          break;
        default:
          // do nothing; you can add new controller case here
          break;
      }
    })
  }

  static async ignoreCase(ctx, control_info) {
    const { task_id: dest_task_id, condition } = control_info;

    const http_response = _.get(ctx, ['public', ctx.task_id, 'result', 'response', 'data'], {});

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
      _.set(ctx, ['public', dest_task_id, this.type, 'ignore'], true);
    }
  }

  static async destCase(ctx, control_info) {
    const { condition } = control_info;

    const http_response = _.get(ctx, ['public', ctx.task_id, 'result', 'response', 'data'], {});

    // response match and will return dest task id
    // only need one param no match, it will miss
    const exist_no_match = Object.entries(condition).find(
      ([key, value]) => {
        if (_.has(http_response, key)) {
          return (_.get(http_response, key) !== value)
        }
        return false;
      }
    );

    if (!exist_no_match) {
      if (_.has(control_info, ['flow_id'])) {
        _.set(ctx, ['public', 'next_task_id'], 'next_task_no_exist');
      }
      if (_.has(control_info, ['task_id'])) {
        const dest_task_id = _.get(control_info, ['task_id']);
        _.set(ctx, ['public', 'next_task_id'], dest_task_id);
      }
    }
  }
}

module.exports = Controller;
