const Log = require("../middleware/log");
const Setting = require("../middleware/setting");
const Convert = require("../middleware/convert/spec_convert");

async function execute() {
    try {
        Setting.initialize();
        Log.initialize(Setting.getInstance().log_level());
    } catch(e) {
        console.log(e.message);
    }

    try {
        Convert.initialize({log_module: Log.getInstance()});

        Convert.getInstance().run("0.0.1", "../spec/0.0.1/");
        Convert.getInstance().run("2.0.0", "../");
        Convert.getInstance().run("2.1.0", "../");
        Convert.getInstance().run("3.0.0", "../");
    } catch (e) {
        Log.getInstance().error(e.message);
    }
}

 