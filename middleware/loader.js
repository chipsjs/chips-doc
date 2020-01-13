const faker = require("json-schema-faker");
const fs = require("fs");

const Base = require("../lib/base_class");
const api_doc_json = require("../api_doc.json");
const api_flow_json = require("../api_flow.json");
const api_special_json = require("../api_special_case.json");

class Loader extends Base.factory() {
    constructor() {
        super();
        this._api_doc_map = new Map();
        this._test_cases = {};
    }

    static initialize({log_module, temp_test_case_path, special_test_case_path}) {
        this.loadInstance({
            read_only_properties: {
                logger: log_module || console,
                temp_test_case_path: temp_test_case_path,
                special_test_case_path: special_test_case_path
            }
        });
    }
    //generate_case module
    _docCheck(api_name, api_doc_info) {
        if(typeof api_name === "undefined" || typeof api_doc_info.method_type === "undefined" || typeof api_doc_info.url === "undefined")  {
            throw new TypeError("Loader::_docCheck: api doc format error! api name is " + api_name);
        }

        switch(api_doc_info.method_type) {
            case "get":
            case "post":
            case "put":
            case "delete":
                //do nothing;
                break;
            default:
                throw new TypeError("Loader::_docCheck: api doc format error! api name is " + api_name);
        }

        return true;
    }

    async _overwriteByPublicParam(public_param_obj, api_result) {
        for(let i in api_result.body) {
            if(!public_param_obj.hasOwnProperty(i)) continue;

            if(!public_param_obj[i]) {
                public_param_obj[i] = api_result.body[i];
            } else {
                api_result.body[i] = public_param_obj[i];
            }
        }

        for(let i in api_result.query) {
            if(!public_param_obj.hasOwnProperty(i)) continue;

            if(!public_param_obj[i]) {
                public_param_obj[i] = api_result.query[i];
            } else {
                api_result.query[i] = public_param_obj[i];
            }
        }
    }

    async _overwriteBySpecialCondition(special_condition, api_result) {
        if(typeof special_condition !== "object") return;

        Object.keys(special_condition).forEach(i => {
            if(typeof api_result.query ==="object" && api_result.query.hasOwnProperty(i)) {
                api_result.query[i] = special_condition[i];
            }

            if(typeof api_result.body ==="object" && !api_result.body.hasOwnProperty(i)) {
                api_result.body[i] = special_condition[i];
            }
        })
    }

    async _generatePath(special_condition, path_condition, api_result) {
        if(typeof special_condition !== "object" || typeof path_condition !== "object")  return;

        let path = await this._fakerData(path_condition);
        Object.keys(special_condition).forEach(i => {
            if(path.hasOwnProperty(i)) {
                path[i] = special_condition[i];
            }
        });

        Object.keys(path).forEach(i => {
            let temp_str = ":" + i;
            api_result.url = api_result.url.replace(temp_str, path[i]);
        });
    }

    async _fakerData(input) {
        return new Promise(resolve => {
            faker.resolve(input).then(result => {
                resolve(result);
            })
        });
    }

    async _parseDoc2Info({api_name = "", public_param_obj = {}, special_condition = {}}) {
        let api_info = this._api_doc_map.get(api_name);

        // if(typeof api_info === "undefined" ||  typeof api_info.request === "undefined") throw new TypeError("Loader::_parseDoc2Info:parser api_doc fail!!please check data type");
        let result = {
            api_name: api_name,
            method_type: api_info.method_type,
            url: api_info.url
        };

        if(typeof api_info.request.body !== "undefined") {
            result.body = await this._fakerData(api_info.request.body);
        }

        if(typeof api_info.request.query !== "undefined") {
            result.query = await this._fakerData(api_info.request.query);
        }

        await this._overwriteByPublicParam(public_param_obj, result);
        await this._overwriteBySpecialCondition(special_condition, result);
        await this._generatePath(special_condition, api_info.request.path ,result);

        result.response = api_info.response;

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

            let api_result = await this._parseDoc2Info({
                api_name: api_name,
                public_param_obj: public_param_obj,
                special_condition: api_flow[api_name]
            });


            test_case_arr.push(api_result);
        }

        return test_case_arr;
    }

    loadApiDoc() {
        Object.keys(api_doc_json).forEach(i => {
            if(this._docCheck(i, api_doc_json[i])) {
                this._api_doc_map.set(i, api_doc_json[i]);
            }
        });
    }

    _existInApiDoc(key) {
        return this._api_doc_map.has(key);
    }

    async outputSpecialCase() {
        let special_json = {};

        Object.keys(api_special_json).forEach(i => {
            if(this._existInApiDoc(i)) {
                let key = i;
                let api_doc = this._api_doc_map.get(i);
                let value = {};
                value.method_type = api_doc.method_type;
                value.url = api_doc.url;
                if(Array.isArray(api_special_json[i]) === true ) {
                    api_special_json[i].forEach(j => {
                        //todo,校验数据格式
                    });
                }
                value.cases = api_special_json[i];

                special_json[key] = value;
            }
        });

        if(Object.keys(special_json).length !== 0) {
            fs.writeFileSync(this.special_test_case_path(), JSON.stringify(special_json, null, 4));
        }
    }

    async outputTestCaseFlow() {
        for(const i of Object.keys(api_flow_json)) {
            this._test_cases[i] = await this._generateTestCaseFlow(api_flow_json[i]);
        }

        fs.writeFileSync(this.temp_test_case_path(), JSON.stringify(this._test_cases, null, 4));
    }
}

module.exports = Loader;