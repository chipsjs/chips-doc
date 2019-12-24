const request = require("request");
const Log = require("../middleware/log");

class Task {
    constructor(task_name, test_case_queue) {
        this._task_name = task_name;
        this._test_case_queue = test_case_queue;
    }

    async _bindHttpGet(func_arr, test_case) {

    }

    async _bindHttpCommon(func_arr, test_case) {

        //request

        //response check

        //失败throw task_name
    }

    async execute() {
        let func_arr = [];

        for(let i in this._test_case_queue) {
            let test_case = this._test_case_queue[i];

            switch (test_case.method_type) {
                case "get":
                    this._bindHttpGet(func_arr, test_case);
                    break;
                case "post":
                case "put":
                case "delete":
                    this._bindHttpCommon(func_arr, test_case);
                    break;
                default:
                    throw new TypeError("Task::sendHttpRequest: fail! task name is " + this._task_name) + ". It has unsupported method_type";
            }
        }

        for(let i in func_arr) {
            await func_arr[i];
        }

        Log.getInstance().info("Task:: " + this._task_name + " execute success!!!");
    }
}

module.exports = Task;