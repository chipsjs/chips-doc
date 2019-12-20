const Setting = require("../middleware/setting");
const Log = require("../middleware/log");

// async function export

async function publicInit() {
    await Setting.getInstance().init();
    await Log.getInstance().init();
    // await
}

module.exports = {publicInit};
