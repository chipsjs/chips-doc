
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

    execute() {

    }


}

module.exports = Task;

//加载任务，加载公用数据到loader中