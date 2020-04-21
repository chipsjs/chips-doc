const Loader = require('../middleware/fake/loader');
const Log = require('../middleware/log');
const Setting = require('../middleware/setting');

const api_doc_json = require('../api_doc.json');
const api_flow_json = require('../api_flow.json');
const api_special_json = require('../api_special_case.json');

async function execute() {
  try {
    Setting.initialize();
    Log.initialize(Setting.getInstance().log_level());
  } catch (e) {
    console.log(e.message);
  }

  try {
    Loader.initialize({
      log_module: Log.getInstance(),
      temp_test_case_path: Setting.getInstance().temp_test_case_path_in_generate_module(),
      special_test_case_path: Setting.getInstance().special_test_case_path_in_generate_module(),
    });

    await Loader.getInstance().loadApiDoc(api_doc_json);
    await Loader.getInstance().outputTestCaseFlow(api_flow_json);
    await Loader.getInstance().outputSpecialCase(api_special_json);
  } catch (e) {
    Log.getInstance().error(e.message);
  }
}

execute();
