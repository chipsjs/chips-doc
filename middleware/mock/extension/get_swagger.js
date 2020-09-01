const _ = require('lodash');
const config = require('config');

const BaseExtension = require('./base_extension');
const { Swagger } = require('../../../lib');

/**
 * getSwagger support params.version && params.onlymock
 *
 * @class GetSwagger
 * @extends {BaseExtension}
 */
class GetSwagger extends BaseExtension {
  static async run(ctx, next) {
    const version = _.get(ctx, [this.type, 'params', 'version'], config.get('default_swagger_version'));
    const swagger = _.get(ctx, ['public', 'swaggers', version]);

    const onlymock_params = _.get(ctx, [this.type, 'params', 'onlymock'], []);
    const operation_obj = Swagger.filterSwaggerByOnlyMockParams(
      Swagger.getOperationObjectFromSwagger(
        swagger, ctx.url, ctx.method_type
      ), onlymock_params
    );

    _.set(ctx, ['operation_obj'], operation_obj);
    _.set(ctx, ['path_parameters'], Swagger.getPathParameters(swagger, ctx.url));
    await next();
  }
}

module.exports = GetSwagger;
