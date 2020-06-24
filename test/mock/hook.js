module.exports = (obj, target_function, hook_function) => {
  if (typeof hook_function === 'function') {
    // eslint-disable-next-line no-param-reassign
    obj[target_function] = (...args) => {
      hook_function(args);
    };
  }
};
