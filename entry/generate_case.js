const fs = require("fs");

const {publicInit} = require("../middleware/assist_macro");
const Loader = require("../model/loader");
const Setting = require("../middleware/setting");
const Log = require("../middleware/log");

async function execute() {
    try {
        await publicInit();

        await Loader.getInstance().loadApiDoc();
        await Loader.getInstance().loadApiFlow();

        let test_case_flow = await Loader.getInstance().outputTestCaseFlow();
        fs.writeFileSync(Setting.getInstance().getSetting("temp_test_case_path_in_generate_module"), "module.exports = " + JSON.stringify(test_case_flow, null, 4) + ";");
    } catch (e) {
        Log.getInstance().error(e.message);
    }
}

execute();

//

//区分query和body
