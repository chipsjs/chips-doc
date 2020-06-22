const config = require('config');

const axios = require('axios').create({
  baseURL: config.get('mock_server'),
  timeout: 2500
});

// const no_body_methods = ['delete', 'get', 'head', 'options'];

/**
 *
 *
 * @param {string} url - api name
 * @param {string} method - method type
 * @param {object} request_config - axios config
 * @param {string} [request_config.params] - query
 * @param {string} [request_config.headers] - header
 * @param {string} [request_config.data] - request body
 */
module.exports = async (url, method, request_config) => {
  const { data, status } = await axios({
    url,
    method,
    ...request_config
  })

  return { data, status };
};
