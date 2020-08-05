const _ = require('lodash');

const extensions = require('./extension');
const { compose } = require('../../lib');

class Task {
  /**
   * Creates an instance of Task.
   *
   * @param {{url: string, method_type: string, swagger: object,
   * task_id: string, middlewares: object, headers: object, swaggers: object, context: object
   * }} options - instance args
   * @memberof Task
   */
  constructor(options) {
    this._createContext(options);
  }

  async run() {
    await this.fnMiddlewares(this.context);
  }

  _createContext(options) {
    this.context = {
      task_id: options.task_id,
      url: options.url,
      method_type: options.method_type,
      headers: options.headers,
      swaggers: options.swaggers,
      public: options.context
    };

    const fnMiddlewares = Task.preSetExtension(options.middlewares).map((ele) => {
      const extension_type = ele.middleware.toLowerCase();
      // ignore or throw, TO DO
      if (!Task._isAllowExtension(extension_type)) {
        throw new TypeError(`no support this extension: ${extension_type}`);
      }

      _.set(this.context, [extension_type, 'params'], ele.params);
      return extensions[extension_type].run.bind(extensions[extension_type]);
    });
    this.fnMiddlewares = compose(fnMiddlewares);
  }

  /**
   * set default middleware 'Controller' && 'HttpClient' when there is not in extension
   *
   * @static
   * @param {object} middlewares - ctx
   * @returns {object []} - middlewares
   * @memberof Task
   */
  static preSetExtension(middlewares) {
    let new_middlewares = _.cloneDeep(middlewares);
    new_middlewares = Task.preSetController(new_middlewares);
    new_middlewares = Task.preSetHttpClient(new_middlewares);
    new_middlewares = Task.preSetGetSwagger(new_middlewares);
    return new_middlewares;
  }

  static preSetGetSwagger(middlewares) {
    const middleware = middlewares.find((ele) => ele.middleware === extensions.getswagger.type);
    if (middleware) {
      return middlewares;
    }

    // find index, insert getswagger middleware before httpclient middleware
    const index = middlewares.findIndex((ele) => ele.middleware === extensions.httpclient.type);
    middlewares.splice(index, 0, { middleware: extensions.getswagger.type });
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
    const middleware = middlewares.find((ele) => ele.middleware === extensions.controller.type);
    if (middleware) {
      return middlewares;
    }

    return [{ middleware: extensions.controller.type }].concat(middlewares);
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
    const middleware = middlewares.find((ele) => ele.middleware === extensions.httpclient.type);
    if (middleware) {
      return middlewares;
    }

    return middlewares.concat([{ middleware: extensions.httpclient.type }]);
  }

  static _isAllowExtension(extension_type) {
    return extensions.getTypes().includes(extension_type);
  }
}

module.exports = Task;
