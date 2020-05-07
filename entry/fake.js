const Fake = require('../middleware/fake/fake');
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
    Fake.initialize({
      log_module: Log.getInstance(),
      temp_test_case_path: Setting.getInstance().temp_test_case_path_in_generate_module(),
      special_test_case_path: Setting.getInstance().special_test_case_path_in_generate_module(),
    });

    await Fake.getInstance().loadApiDoc(api_doc_json);
    await Fake.getInstance().outputTestCaseFlow(api_flow_json);
    await Fake.getInstance().outputSpecialCase(api_special_json);
  } catch (e) {
    Log.getInstance().error(e.message);
  }
}

execute();
