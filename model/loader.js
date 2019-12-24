const faker = require("json-schema-faker");

const api_doc_arr = require("../api_doc");
const api_flow_arr = require("../api_flow");

class Loader {
    constructor() {
        this._api_doc_map = new Map();
        this._test_case_map = {};
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
            throw new TypeError("Loader::_docCheck: api doc format error! api name is " + api_doc_info.api_name);
        }

        switch(api_doc_info.method_type) {
            case "get":
            case "post":
            case "put":
            case "delete":
                //do nothing;
                break;
            default:
                throw new TypeError("Loader::_docCheck: api doc format error! api name is " + api_doc_info.api_name);
        }

        return true;
    }

    _overwriteByPublicParam(public_param_obj, api_result) {
        for(let j in api_result.body) {
            if(!public_param_obj.hasOwnProperty(j)) continue;

            if(!public_param_obj[j]) {
                public_param_obj[j] = api_result.body[j];
            } else {
                api_result.body[j] = public_param_obj[j];
            }
        }

        for(let j in api_result.query) {
            if(!public_param_obj.hasOwnProperty(j)) continue;

            if(!public_param_obj[j]) {
                public_param_obj[j] = api_result.query[j];
            } else {
                api_result.query[j] = public_param_obj[j];
            }
        }
    }

    _overwriteBySpecialCondition(api_flow, api_result) {
        //TODO
    }

    async _fakerData(input) {
        return new Promise(resolve => {
            faker.resolve(input).then(result => {
                resolve(result);
            })
        });
    }

    async _parseDoc2Info(api_name) {
        let api_info = this._api_doc_map.get(api_name);

        // if(typeof api_info === "undefined" ||  typeof api_info.request === "undefined") throw new TypeError("Loader::_parseDoc2Info:parser api_doc fail!!please check data type");

        let result = {
            api_name: api_info.api_name,
            method_type: api_info.method_type,
            url: api_info.url, // temp,todo
            response: api_info.response
        };

        //暂时不考虑path中的转换
        if(typeof api_info.request.body !== "undefined") {
            result.body = await this._fakerData(api_info.request.body);
        }

        if(typeof api_info.request.query !== "undefined") {
            result.query = await this._fakerData(api_info.request.query);
        }

        return result;
    }

    //解析apidoc里的jsonschema + apiflow中的特定规则生成test_case;
    async _generateTestCaseFlow(api_flow) {
        let test_case_arr = [];
        let public_param_obj = {};

        if(Array.isArray(api_flow.public_param)) {
            for(let i in api_flow.public_param) {
                public_param_obj[api_flow.public_param[i]] = null;
            }
        }

        for(let i in api_flow.flow) {
            let api_name = api_flow.flow[i];
            if(!this._existInApiDoc(api_name)) {
                throw new TypeError("Loader::_generateTestCaseFlow: generate test case fail! The most likely reason is that " + api_name + " does not exist in api_doc.js or its format is error");
            }

            let api_result = await this._parseDoc2Info(api_name);
            this._overwriteByPublicParam(public_param_obj, api_result);
            this._overwriteBySpecialCondition(api_flow, api_result);

            test_case_arr.push(api_result);
        }

        return test_case_arr;
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

    async loadApiFlow() {
        for(let i in api_flow_arr) {
            this._test_case_map[i] = await this._generateTestCaseFlow(api_flow_arr[i]);
        }
    }

    outputTestCaseFlow() {
        return this._test_case_map;
    }
}

module.exports = Loader;