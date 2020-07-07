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
        throw new TypeError(`Task::no support this extension: ${provider_type}`);
      }

      this._createProviderContext(provider_type, ele.params);
      return providers[provider_type].run.bind(null, this.context);
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
      extension: _.get(context, ['extensions', task_id], [{ middleware: 'HttpClient' }]),
    }
  }

  _createProviderContext(provider_type, params) {
    _.set(this.context, [provider_type, 'params'], params);
  }

  static _isAllowExtension(provider_type) {
    return providers.types.includes(provider_type);
  }
}

module.exports = Task;
