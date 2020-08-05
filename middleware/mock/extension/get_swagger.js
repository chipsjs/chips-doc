const _ = require('lodash');
const config = require('config');

const BaseExtension = require('./base_extension');
const { Swagger } = require('../../../lib');

class GetSwagger extends BaseExtension {
  static async run(ctx, next) {
    const version = _.get(ctx, [this.type, 'params', 'version'], config.get('default_swagger_version'));
    const swagger = _.get(ctx, ['public', 'swaggers', version]);

    _.set(ctx, ['operation_obj'], Swagger.getOperationObjectFromSwagger(
      swagger, ctx.url, ctx.method_type
    ));
    _.set(ctx, ['path_parameters'], Swagger.getPathParameters(swagger, ctx.url));
    await next();
  }
}

module.exports = GetSwagger;
