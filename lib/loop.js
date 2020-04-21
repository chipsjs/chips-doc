/**
 *
 * @param {Symbol.Iterator} iterator -
 * @param {Function: (item) => {}:Promise<Boolean>} [handler = async () => { }] -
 * @returns {Promise<void>} -
 */
async function travel(iterator, handler = async () => {}) {
  const { value, done } = iterator.next();

  if (!done) {
    await handler(value).then((abort) => (abort || travel(iterator, handler)))
  }
}

const loop = {
  /**
   *
   * @param {Array Iterator} iterator - array iterator
   * @param {Function<(item) => {}: Promise<void>>} handler -
   * @returns {Promise<void>}
   */
  async forEach(iterator, handler) {
    await travel(iterator, async (item) => {
      await handler(item)
    });
  },

  /**
   *
   * @param {Array<any>} arrayLikes - array like
   * @param {Function<(item) => {}: Promise<any>>} handler -
   * @returns {Promise<Array<any>>}
   */
  async map(arrayLikes, handler) {
    const results = [];
    await travel(arrayLikes, async (item) => {
      const result = await handler(item);
      results.push(result);
    });
    return results;
  },

  /**
   *
   * @param {Array Iterator} iterator - array iterator
   * @param {Function<(item) => {}:Promise<Boolean>>} handler -
   * @returns {Promise<Boolean>}
   */
  async find(iterator, handler) {
    let result;
    await travel(iterator, async (item) => {
      const hasFound = await handler(item);
      if (hasFound) {
        result = item
        return true
      }
      return false
    });
    return result;
  },

  /**
   *
   * @param {Array Iterator} iterator - array iterator
   * @param {Function<(prev, item) => {}:Promise<prev>>} handler -
   * @param {any} initialValue - initial value
   * @returns {Promise<any>} -
   */
  async reduce(iterator, handler, initialValue) {
    let prev = initialValue;
    await travel(iterator, async (item) => {
      prev = await handler(prev, item)
    });
    return prev;
  }
};

module.exports = loop;
