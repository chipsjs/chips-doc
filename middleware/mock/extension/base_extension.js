/**
 *
 *
 * @class BaseExtension
 */
class BaseExtension {
  /**
   * return class name lowercase as provider type
   *
   * @readonly
   * @static
   * @returns {string} - lower case name
   * @memberof BaseExtension
   */
  static get type() {
    return this.name.toLowerCase();
  }

  /**
   * property types
   *
   * @readonly
   * @returns {string} - extentsion type
   * @memberof BaseExtension
   */
  get type() {
    return this.constructor.type;
  }
}

module.exports = BaseExtension;
