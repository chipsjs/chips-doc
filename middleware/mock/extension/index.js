const providers = {};
providers.HttpClient = require('./http_client');
providers.Controller = require('./controller');

providers.types = {
  http_client: providers.HttpClient.type,
  controller: providers.Controller.type
}

providers.getTypes = () => Object.values(providers.types);

module.exports = providers;
