
const fs = require("fs");


const {publicInit} = require("../middleware/assist_macro");
const Filter = require("../model/filter");
const Parser = require("../model/parser");
const Loader = require("../model/loader");
const Setting = require("../middleware/setting");
const Log = require("../middleware/log");

async function init() {
    await publicInit();
    await Loader.getInstance().loadApiDoc();




    //     let result = await Parser.getInstance().parseDoc2Info(api);
    //     result_obj[result.api_name] = result;
    // }

    fs.writeFileSync(Setting.getInstance().getSetting("temp_test_case_path"), "module.exports = " + JSON.stringify(result_obj, null, 4) + ";");
}

init();

//

//区分query和body
