const config = require('config');

const { http } = require('../../lib');
const router = require('./router');

const { request: originalRequest } = http;

module.exports.mockServerStart = () => {
  http.request = ({
    base_url, path, method, params = {}, body = null, headers = {}
  }) => {
    if (config.get('mock_server') !== base_url) {
      throw new Error('url no match');
    }

    return router.fakeRequest(path, method, {
      params, body, headers
    });
  };
};

module.exports.mockServerRestore = () => {
  http.request = originalRequest;
};

module.exports.callFunction = () => {
  // do nothing
};

