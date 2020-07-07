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
    const extension = this.task.extensions;
    const middlewares = extension.map((ele) => {
      const provider_type = ele.middleware;
      // ignore or throw, TO DO
      if (!Task._isAllowExtension(providers)) {
        throw new TypeError(`Task::no support this extension: ${provider_type}`);
      }

      this._createProviderContext(provider_type, ele.params);
      return providers[provider_type].run.bind(null, this.context);
    });

    await compose(middlewares);
  }

  _createContext(options) {
    const {
      context, url, method_type, headers
    } = options;
    const task_id = _.get(context, ['current_task_id'], {});

    this.context = context || {};
    this.context.task = {
      task_id,
      url: url || '',
      method_type: _.get(context, [method_type], 'unknown'),
      headers,
      extension: _.get(context, ['extensions', task_id], [{ middleware: providers.type.HttpClient }]),
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
