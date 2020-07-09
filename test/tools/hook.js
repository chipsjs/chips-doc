// const fakeResponse = (url, method, request_config) => {
//   const data = {};
//   let status = 200;

//   // TODO, 路由解析
// };

module.exports = (target_function, hook_function) => {
  if (typeof hook_function === 'function') {
    // eslint-disable-next-line no-param-reassign
    target_function = (...args) => {
      hook_function(args);
    };
  }
};
