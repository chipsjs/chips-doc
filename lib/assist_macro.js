const {promisify} = require("util");

const request = require("request");
const httpRequest = {
    get: promisify(request.get),
    post: promisify(request.post),
    put: promisify(request.put),
    delete: promisify(request.delete),
};

const dataValidate = require('jsonschema').validate;
// const dataValidate = promisify(validate);
module.exports = {httpRequest, dataValidate};