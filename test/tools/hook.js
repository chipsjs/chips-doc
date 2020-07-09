// TODO, cant work
module.exports = (target_function, hook_function) => {
  if (typeof hook_function === 'function') {
    // eslint-disable-next-line no-param-reassign
    target_function = (...args) => {
      hook_function(args);
    };
  }
};
