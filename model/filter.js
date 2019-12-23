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

    _addApi(api_name) {
        this._api_set.add(api_name);
    }

    async init() {
        for(let i in flow) {
            if(typeof i !== "string" || !Array.isArray(flow[i])) throw new TypeError(ERROR.API_FLOW_ERROR);

            for(let j in flow[i]) {
                this._addApi(flow[i][j]);
            }
        }
    }

    isUseless(api_name) {
        return !this._api_set.has(api_name);
    }
}

module.exports = Filter;