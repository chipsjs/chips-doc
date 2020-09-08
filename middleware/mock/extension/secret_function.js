const _ = require('lodash');

const BaseExtension = require('./base_extension');

/**
 * this middleware can excute function before/after task execute,
 * but it is lower priority than controller middleware.Otherwise,
 * this middleware must!! excute in a safty env, dont expose to external env
 *
 * @class SecretFunction
 * @extends {BaseExtension}
 */
class SecretFunction extends BaseExtension {
  static async run(ctx, next) {
    await SecretFunction.beforeProcess(ctx);
    await next();
    await SecretFunction.afterProcess(ctx);
  }

  static async beforeProcess(ctx) {
    const fn = _.get(ctx, [this.type, 'params', 'before']);
    if (typeof fn === 'function') {
      const context = _.get(ctx, ['public', 'context'])
      await fn(context);
    }
  }

  static async afterProcess(ctx) {
    const fn = _.get(ctx, [this.type, 'params', 'after']);
    if (typeof fn === 'function') {
      const context = _.get(ctx, ['public', 'context']);
      const res = _.get(ctx, ['public', ctx.task_id, 'result', 'response', 'data'], {});
      await fn(context, res);
    }
  }
}

module.exports = SecretFunction;
