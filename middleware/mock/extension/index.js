const extensions = {};
extensions.httpclient = require('./http_client');
extensions.controller = require('./controller');
extensions.getswagger = require('./get_swagger');
extensions.secretfunction = require('./secret_function');

extensions.getTypes = () => [
  extensions.httpclient.type,
  extensions.controller.type,
  extensions.getswagger.type,
  extensions.secretfunction.type
];

module.exports = extensions;
