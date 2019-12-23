const Task = require("./task");
const flow = require("../api_flow");
const Log = require("../middleware/log");
const {ERROR} = require("../lib/common");

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
            if(typeof i !== "string" || !Array.isArray(flow[i])) throw new TypeError(ERROR.API_FLOW_ERROR);

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
        try{
            for(let i in this._queue) {
                this._queue[i].execute();
            }
        } catch(e) {
            Log.getInstance().error("TaskQueue execute fail!!");
        }
    }
}

module.exports = TaskQueue;

//加载任务，加载公用数据到loader中