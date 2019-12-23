const Log = require("../middleware/log");

class Task {
    constructor(task_name, api_queue) {
        this._task_name = task_name;
        this._api_queue = api_queue;
    }

    static getInstance() {
        if(!this._instance) {
            this._instance = new Task();
        }

        return this._instance;
    }

    async execute() {
        //判断api_queue以及task_name error
        //记录task_name


    }


}

module.exports = Task;