const _ = require('lodash');

const providers = require('./extension');
const { compose } = require('../../lib');

class Task {
  /**
   * Creates an instance of Task.
   *
   * @param {{url: string, method_type: string, swagger: object,
   * context: {current_task_id: string, extensions: object}, headers: object
   * }} options - instance args
   * @memberof Task
   */
  constructor(options) {
    this._createContext(options);
  }

  async run() {
    const extension = _.get(this.context, ['task', 'extension'], []);
    const middlewares = extension.map((ele) => {
      const provider_type = ele.middleware;
      // ignore or throw, TO DO
      if (!Task._isAllowExtension(provider_type)) {
        throw new TypeError(`no support this extension: ${provider_type}`);
      }

      this._createProviderContext(provider_type, ele.params);
      return providers[provider_type].run.bind(null);
    });

    const fnMiddleware = await compose(middlewares);
    await fnMiddleware(this.context);
  }

  _createContext(options) {
    const {
      context, url, method_type, headers
    } = options;
    const task_id = _.get(context, ['current_task_id'], {});

    this.context = context || {};
    this.context.task = {
      task_id,
      url,
      method_type,
      headers,
      extension: Task.preSetExtension(context),
    }
  }

  /**
   * set default middleware 'Controller' && 'HttpClient' when there is not in extension
   *
   * @static
   * @param {object} ctx - ctx
   * @returns {object []} - middlewares
   * @memberof Task
   */
  static preSetExtension(ctx) {
    let middlewares = _.get(ctx, ['extensions', ctx.current_task_id], []);
    middlewares = Task.preSetController(middlewares);
    middlewares = Task.preSetHttpClient(middlewares);
    return middlewares;
  }

  /**
   *
   *
   * @static
   * @param {object[]} middlewares - old middlewares
   * @returns {object[]} - new middlewares
   * @memberof Task
   */
  static preSetController(middlewares) {
    const middleware = middlewares.find((ele) => ele.middleware === providers.types.controller);
    if (middleware) {
      return middlewares;
    }

    return [{ middleware: providers.types.controller }].concat(middlewares);
  }

  /**
   *
   *
   * @static
   * @param {object[]} middlewares - old middlewares
   * @returns {object[]} - new middlewares
   * @memberof Task
   */
  static preSetHttpClient(middlewares) {
    const middleware = middlewares.find((ele) => ele.middleware === providers.types.http_client);
    if (middleware) {
      return middlewares;
    }

    return middlewares.concat([{ middleware: providers.types.http_client }]);
  }

  _createProviderContext(provider_type, params) {
    _.set(this.context, [this.context.current_task_id, provider_type, 'params'], params);
  }

  static _isAllowExtension(provider_type) {
    return providers.getTypes().includes(provider_type);
  }
}

module.exports = Task;
