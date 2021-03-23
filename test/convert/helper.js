const _ = require('lodash');

const base_spec = require('./base_spec.json');
const extention_swagger = require('./swagger_extention');

/**
 * used to mock a spec
 *
 * @param {string} api_name - api name
 * @returns {object} - spec
 */
module.exports.generateSpec = (api_name) => {
  const json = base_spec[api_name];
  const spec = _.set({}, api_name, json);
  return spec;
};

module.exports.generateSwagger = (api_name) => {
  if (!api_name) return {};

  const json = extention_swagger[api_name];
  const spec = _.set({}, api_name, json);
  return spec;
};
