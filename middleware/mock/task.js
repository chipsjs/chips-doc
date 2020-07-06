const _ = require('lodash');

const providers = require('./extension');
const { compose } = require('../../lib');

class Task {
  /**
   * Creates an instance of Task.
   *
   * @param {{task_id: string, url: string, method_type: string,
   *  swagger: object, extension: object, context_params: object, headers: object
   * }} options - instance args
   * @memberof Task
   */
  constructor(options) {
    this.extensions = options.extensions || [{ middleware: providers.type.HttpClient }];
    this._createContext(options);
  }

  async run() {
    const middlewares = this.extensions.map((ele) => {
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
    this.context = {};

    const {
      task_id, url, method_type, swagger, context_params, headers
    } = options;

    this.context.task_id = task_id || 'unknown';
    this.context.url = url || 'unknown';
    this.context.method_type = method_type || 'unknown';
    this.context.swagger = swagger || {};
    this.context.context_params = _.cloneDeep(context_params) || {};
    this.context.headers = headers;
  }

  _createProviderContext(provider_type, params) {
    _.set(this.context, [provider_type, 'params'], params);
  }

  static _isAllowExtension(provider_type) {
    return providers.types.includes(provider_type);
  }
}

module.exports = Task;
