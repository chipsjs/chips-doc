class Loader {
    constructor() {
        this._api_map = new Map();
    }

    static getInstance() {
        if(!this._instance) {
            this._instance = new Loader();
        }

        return this._instance;
    }

    async init() {

    }

    async load(api_name, test_case_arr) {
        this._api_map[api_name] = test_case_arr;
    }
}

module.exports = Loader;