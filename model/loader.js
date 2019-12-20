class Loader {
    constructor() {
        this._map = new Map();
    }

    static getInstance() {
        if(!this._instance) {
            this._instance = new Loader();
        }

        return this._instance;
    }

    async init() {

    }

    async load(api) {
        this._map[api.name] = api.info;
    }
}

module.exports = Loader;