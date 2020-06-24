const config = require('config');
const Base = require('../lib/base_class');

class Setting extends Base.factory() {
  static initialize() {
    this.loadInstance({
      read_only_properties: {
        log_level: process.env.LOG_LEVEL || config.get('log_level'),
        temp_test_case_path_in_generate_module: `./${config.get('temp_test_case_path')}`,
        temp_test_case_path_in_mock_module: `../${config.get('temp_test_case_path')}`,
        special_test_case_path_in_generate_module: './test_case/special.json',
        special_test_case_path_in_mock_module: '../test_case/special.json',
        report_path: process.env.REPORT_PATH || config.get('report_path'),
      }
    });
  }
}

module.exports = Setting;
