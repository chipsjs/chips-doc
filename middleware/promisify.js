const {promisify} = require("util");
const request = require("request");

const httpRequest = {
    get: promisify(request.get),
    post: promisify(request.post),
    put: promisify(request.put),
    delete: promisify(request.delete),
};

module.exports = {httpRequest};