const {promisify} = require("util");

const Setting = require("../middleware/setting");
const Log = require("./log");
const Loader = require("./loader");
const publicInit = async() => {
    await Setting.getInstance().init();
    await Log.getInstance().init(Setting.getInstance().getSetting("log_level"));

    await Loader.getInstance().init(Log.getInstance());
};

const request = require("request");
const httpRequest = {
    get: promisify(request.get),
    post: promisify(request.post),
    put: promisify(request.put),
    delete: promisify(request.delete),
};
const dataValidate = require('jsonschema').validate;
// const dataValidate = promisify(validate);
module.exports = {publicInit, httpRequest, dataValidate};