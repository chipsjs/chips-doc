const faker = require("json-schema-faker");
const {ERROR} = require("../lib/common");

class Parser {
    constructor() {
    }

    static getInstance() {
        if(!this._instance) {
            this._instance = new Parser();
        }

        return this._instance;
    }

    async init() {

    }

    async _checkType(api_info) {
        if(typeof api_info === "undefined" ||  typeof api_info.request === "undefined") throw new TypeError(ERROR.DATA_TYPE_ERROR);

        //more
    }

    async _fakerData(input) {
        faker.resolve(input).then(result => {
            return result;
        });
    }

    async _cloneBaseInfo(api_obj) {
        return {
            api_name: api_obj.api_name,
            method_type: api_obj.method_type,
            url: api_obj.url // temp,todo
        };
    }

    async parseDoc2Info(api_obj) {
        this._checkType(api_obj);

        let result = this._cloneBaseInfo(api_obj);

        //暂时不考虑path中的转换
        if(typeof api_obj.request.body !== "undefined") {
            result.body = this._fakerData(api_obj.request.body);
        }

        if(typeof api_obj.request.query !== "undefined") {
            result.query = this._fakerData(api_obj.request.query);
        }

        return result;
    }
}

module.exports = Parser;