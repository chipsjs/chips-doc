const Task = require("./task");
const Setting = require("./setting");
// const Log = require("../middleware/log");

class TaskQueue {
    constructor() {
        this._queue = [];
    }

    static getInstance() {
        if(!this._instance) {
            this._instance = new TaskQueue();
        }

        return this._instance;
    }

    async init() {
        let test_case_flow_json = require(Setting.getInstance().getSetting("temp_test_case_path_in_mock_module"));

        for(let i of Object.keys(test_case_flow_json)) {
            if(typeof i !== "string" || !Array.isArray(test_case_flow_json[i])) throw new TypeError("TaskQueue::init: test case - " + i + " parse error.please check key and value in test_case.js;it must be promised key is string and value is array");

            await this._addTask(i, test_case_flow_json[i]);
        }
    }

    async _addTask(task_name, api_queue) {
        let task =  new Task(task_name, api_queue);
        this._queue.push(task);
    }

    async execute() {
        for(let i in this._queue) {
            await this._queue[i].execute();
        }
    }
}

module.exports = TaskQueue;

//加载任务，加载公用数据到loader中