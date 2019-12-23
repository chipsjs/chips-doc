const flow = require("../api_flow");
const {ERROR} = require("../lib/common");

class Filter {
    constructor() {
        this._api_set = new Set();
    }

    static getInstance() {
        if(!this._instance) {
            this._instance = new Filter();
        }

        return this._instance;
    }

    async _addApi(api_name) {
        this._api_set.add(api_name);
    }

    async init() {
        for(let i in flow) {
            if(typeof i !== "string" || !Array.isArray(flow[i])) throw new TypeError(ERROR.API_FLOW_ERROR);

            await this._addApi(flow[i]);
        }
    }

    async isUseless(api) {
        return !this._api_set.has(api);
    }
}

module.exports = Filter;