const { makeStruct } = require('./assist_macro');

// document: https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.2.md#oasObject
const OpenApiObject = makeStruct('openapi info servers paths security components tags');
const InfoObject = makeStruct('title description termsOfService version');
const ServerObject = makeStruct('');
// const PathsObject = makeStruct('summary description get put post delete patch');

// const makeSwaggerApiStruct = () => {
//   // const info = new info();
//   // let open_api_struct = new OpenApiStruct('3.0.0', );

//   // return open_api_struct;
// };

module.exports = {
  OpenApiObject, InfoObject, ServerObject
};
