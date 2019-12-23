const api_doc_arr = require("../api_doc");
const api_flow_arr = require("../api_flow");

class Loader {
    constructor() {
        this._api_map = new Map();
        this._api_doc_map = new Map();
        this._logger = console;
    }

    static getInstance() {
        if(!this._instance) {
            this._instance = new Loader();
        }

        return this._instance;
    }

    init(log_module) {
        this._logger = log_module;
    }

    //generate_case module
    _docCheck(api_doc_info) {
        if(typeof api_doc_info.api_name === "undefined" || typeof api_doc_info.method_type === "undefined" || typeof api_doc_info.url === "undefined")  {
            this._logger.error("Loader::_docCheck: api doc format error! api name is " + api_doc_info.api_name);
            return false;
        }

        switch(api_doc_info.method_type) {
            case "get":
            case "post":
            case "put":
            case "delete":
                //do nothing;
                break;
            default:
                this._logger.error("Loader::_docCheck: api doc format error! api name is " + api_doc_info.api_name);
                return false;
        }

        return true;
    }

    _generateTestCase(api_flow) {

    }

    loadApiDoc() {
        for(let i in api_doc_arr) {
            if(!this._docCheck(api_doc_arr[i])) continue;

            this._api_doc_map.set(api_doc_arr[i].api_name, api_doc_arr[i]);
        }
    }

    _existInApiDoc(key) {
        return this._api_doc_map.has(key);
    }

    loadApiFlow() {
        for(let i in api_flow_arr) {
            let api_flow = api_flow_arr[i].flow;
            for(let j in api_flow) {
                let api_name = api_flow[j];
                if(!this._existInApiDoc(api_name)) {
                    this._logger.error("Loader::loadApiFlow: load api flow fail! The most likely reason is that " + api_name + " does not exist in api_doc.js or its format is error");
                    return;
                }
            }
        }
    }

    //加载api_flow
    async load(api_name, test_case_arr) {
        this._api_map[api_name] = test_case_arr;
    }
}

module.exports = Loader;