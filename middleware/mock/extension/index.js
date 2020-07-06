const providers = {};
providers.HttpClient = require('./http_client');
providers.Controller = require('./controller');

providers.types = [
  'HttpClient',
  'Controller'
];
// class ExtensionFactory {
//   static async run(provider_type) {
//     await providers[provider_type].run();
//   }
// }

module.exports = providers;
