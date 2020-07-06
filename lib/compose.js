const compose = async (middlewares) => {
  if (!Array.isArray(middlewares)) throw new TypeError('compose::middlewares is not array');

  middlewares.forEach((middleware) => {
    if (typeof middleware !== 'function') {
      throw new TypeError('compose::middleware is not function')
    }
  });

  return async (context, next) => {
    let index = -1;

    const dispath = (i) => {
      if (i <= index) throw new TypeError('next() call multi times');
      index = i;
      let fn = middlewares[i];

      if (i === middlewares.length) fn = next;
      if (!fn) return Promise.resolve();

      try {
        return Promise.resolve(fn(context, dispath.bind(null, i + 1)));
      } catch (err) {
        return Promise.reject(err);
      }
    };

    return dispath(0);
  };
};

module.exports = compose;
