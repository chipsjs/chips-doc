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

    async parseDoc2Info() {
        return;
    }
}

module.exports = Parser;