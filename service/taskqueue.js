const Task = require("./task");
const flow = require("../api_flow");

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
        for(let i in flow) {
            await this._addTask(i, flow[i]);
        }
    }

    async _addTask(task_name, api_queue) {
        try {
            let task =  new Task(task_name, api_queue);
            this._queue.push(task);

            return true;
        } catch(e) {
            return false;
        }
    }

    async execute() {
        for(let i in this._queue) {
            this._queue[i].execute();
        }
    }
}

module.exports = TaskQueue;

//加载任务，加载公用数据到loader中