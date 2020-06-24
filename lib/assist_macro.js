/**
 * a quick way to make struct
 *
 * @param {string} names - eg: 'A B C'
 * @returns {Function} - struct constructor function
 */
function makeStruct(names) {
  const names_arr = names.split(' ');
  const count = names_arr.length;

  function constructor(...args) {
    for (let i = 0; i < args.length && args.length <= count; i += 1) {
      this[names_arr[i]] = args[i];
    }
  }
  return constructor;
}

module.exports = { makeStruct };
