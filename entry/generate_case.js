const Loader = require("../middleware/loader");
const Log = require("../middleware/log");
const Setting = require("../middleware/setting");

async function execute() {
    try {
        Setting.initialize();
    } catch(e) {
        console.log(e.message);
    }

    try {
        Log.initialize(Setting.getInstance().log_level());
        Loader.initialize({
            log_module: Log.getInstance(),
            temp_test_case_path: Setting.getInstance().temp_test_case_path_in_generate_module(),
            special_test_case_path: Setting.getInstance().special_test_case_path_in_generate_module(),
        });

        await Loader.getInstance().loadApiDoc();
        await Loader.getInstance().outputTestCaseFlow();
        await Loader.getInstance().outputSpecialCase();
    } catch (e) {
        Log.getInstance().error(e.message);
    }
}

execute();

//

//区分query和body
