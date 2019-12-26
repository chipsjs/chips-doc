const Setting = require("../middleware/setting");
const Log = require("./log");
const Loader = require("../model/loader");

const publicInit = async() => {
    await Setting.getInstance().init();
    await Log.getInstance().init();

    await Loader.getInstance().init(Log.getInstance());
    // await Filter.getInstance().init();
    // await
};

// const exportApi = async(api) =>  {
//     if(Filter.getInstance().isUseless(api)) return;
//
//
//     await Loader.getInstance().load(api);
// };


module.exports = {publicInit};