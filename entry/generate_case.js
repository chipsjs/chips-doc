const {publicInit} = require("../middleware/assist_macro");
const Loader = require("../middleware/loader");
const Log = require("../middleware/log");

async function execute() {
    try {
        await publicInit();

        await Loader.getInstance().loadApiDoc();
        await Loader.getInstance().outputTestCaseFlow();
    } catch (e) {
        Log.getInstance().error(e.message);
    }
}

execute();

//

//区分query和body
