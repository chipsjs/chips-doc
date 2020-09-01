
const fetch = require('node-fetch');
const queryString = require('querystring');
const _ = require('lodash');

// const no_body_methods = ['delete', 'get', 'head', 'options'];

/**
 *
 * @param {object} options - options
 * @param {string} options.base_url - base url
 * @param {string} options.path - path
 * @param {string} options.method - method type
 * @param {object} [options.body] - http body
 * @param {object} [options.params] - http params
 * @param {object} [options.headers] - http headers
 * @returns {{data: object, status: number, headers: object}} - http response status & data
 */
module.exports.request = async ({
  base_url, path = '', method, params = {}, body = null, headers = {}
}) => {
  let newUrl = base_url + path;

  if (Object.values(params).length !== 0) {
    newUrl = `${newUrl}?${queryString.stringify(params)}`;
  }

  const config = {
    method,
    headers,
    redirect: 'manual' // redirect by self
  }
  if (!!body && typeof body === 'object' && Object.keys(body).length !== 0) {
    const content_type = _.get(headers, 'Content-Type', 'application/json');
    let converted_body;
    if (content_type === 'application/x-www-form-urlencoded') {
      converted_body = new URLSearchParams();
      Object.entries(body).forEach(([key, value]) => {
        converted_body.append(key, value);
      });
    } else {
      converted_body = JSON.stringify(body);
    }

    config.body = converted_body;
  }

  const response = await fetch(newUrl, config);

  const data = {
    status: response.status,
    headers: response.headers.raw()
  }

  try {
    data.data = await response.json();
  } catch (error) {
    data.data = {
      code: 'unknown',
      message: 'can parse response, content-type may be text/html'
    }
  }

  return data;
};

/**
 *
 *
 * @param {object} ctx - koa ctx
 * @param {object} options - options
 * @param {string} options.base_url - base_url
 * @param {string} [options.path] - path
 * @param {object} [options.params] - http params
 */
module.exports.redirect = async (ctx, { base_url, path = '', params = {} }) => {
  let newUrl = base_url + path;

  if (Object.values(params).length !== 0) {
    newUrl = `${newUrl}?${queryString.stringify(params)}`;
  }

  ctx.redirect(newUrl);
};

module.exports.generateUrl = async ({ base_url, path = '', params = {} }) => {
  let newUrl = base_url + path;

  if (Object.values(params).length !== 0) {
    newUrl = `${newUrl}?${queryString.stringify(params)}`;
  }

  return newUrl;
};
