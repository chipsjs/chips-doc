const fetch = require('node-fetch');
const queryString = require('querystring');

/**
 *
 * @param {object} options - options
 * @param {string} options.base_url - base url
 * @param {string} options.path - path
 * @param {string} options.method - method type
 * @param {object} [options.body] - http body
 * @param {object} [options.params] - http params
 * @param {object} [options.headers] - http headers
 * @returns {object} - response
 */
module.exports.request = async ({
  base_url, path, method, params = {}, body = null, headers = {}
}) => {
  let newUrl = base_url + path;
  if (Object.values(params).length !== 0) {
    newUrl = `${newUrl}?${queryString.stringify(params)}`;
  }
  let request_body = null;
  if (body && Object.keys(body).length !== 0) {
    request_body = body;
  }

  const response = await fetch(newUrl, {
    method,
    body: request_body,
    headers,
  });

  const data = {
    status: response.status,
    headers: response.headers.raw()
  }

  if (data.status === 200) {
    data.data = await response.json();
  }

  return data;
};
