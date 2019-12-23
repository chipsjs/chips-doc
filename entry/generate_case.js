
const fs = require("fs");

const api_doc = require("../api_doc");
const {publicInit} = require("../middleware/assist_macro");
const Filter = require("../model/filter");
const Parser = require("../model/parser");
const Setting = require("../middleware/setting");

async function init() {
    await publicInit();

    let result_arr = [];
    for(let i in api_doc) {
        let api = api_doc[i];
        if(Filter.getInstance().isUseless(api.api_name)) continue;

        let result = await Parser.getInstance().parseDoc2Info(api);
        result_arr.push(result);
    }

    fs.writeFileSync(Setting.getInstance().getSetting("temp_test_case_path"), result_arr);
}

init();

//

//区分query和body
