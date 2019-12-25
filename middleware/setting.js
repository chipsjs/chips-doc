/**
 * define process config,but config will overwrite by process.env
 *
 *
 * @author Kris Xu
 * @date 2019/12/18
 */
const config = require('config');

class Setting {
    constructor() {
        this._config = {};
    }

    static getInstance() {
        if(!this._instance) {
            this._instance = new Setting();
        }

        return this._instance;
    }

    getSetting(key) {
        return this._config[key];
    }

    _loadBaseConfig() {

    }

    _loadEnvConfig() {
        this._config.env = typeof process.env.ENV !== "undefined" ? process.env.ENV : config.get("env");
        this._config.temp_test_case_path_in_generate_module = "./" + config.get("temp_test_case_path");
        this._config.temp_test_case_path_in_mock_module = "../" + config.get("temp_test_case_path");
    }

    async init() {
        this._loadBaseConfig();
        this._loadEnvConfig();
    }
}

module.exports = Setting;