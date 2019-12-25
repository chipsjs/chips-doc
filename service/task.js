const Log = require("../middleware/log");
const {httpRequest} = require("../middleware/promisify");

class Task {
    constructor(task_name, test_case_queue) {
        this._task_name = task_name;
        this._test_case_queue = test_case_queue;
    }

    _check(test_case) {
        if (typeof test_case.url !== "string" || typeof test_case.method_type !== "string") {
            throw new TypeError("Task::_check: error! task name is " + this._task_name) + ". It doesnt have url or method_type";
        }
    }

    _joinQueryField(query) {
        let str = "";
        for(let i in query) {
            str += (i + "=" + query[i] + "&");
        }
        return str.substr(0, str.length - 1);
    }

    _checkResponse(response, test_case) {
        let expect_result = test_case.response;

        if(typeof expect_result === "object") {
            for(let i of Object.keys(expect_result)) {
                if(expect_result[i] !== response[i]) throw new TypeError("api response no match expect, api_name is " + test_case.api_name);
            }
        }
    }

    async _sendHttpRequest(test_case) {
        let url = test_case.url;

        if(typeof test_case.query === "object") {
            url += + "?" + this._joinQueryField(test_case.query);
        }

        let response = {};
        switch (test_case.method_type) {
            case "get":
                response = await httpRequest.get(url);
                break;
            case "post":
                response = await httpRequest.post(url, test_case.body);
                break;
            case "put":
                response = await httpRequest.put(url, test_case.body);
                break;
            case "delete":
                response = await httpRequest.delete(url, test_case.body);
                break;
            default:
                throw new TypeError("Task::sendHttpRequest: fail! task name is " + this._task_name) + ". It has unsupported method_type";
        }

        this._checkResponse(response, test_case);
        Log.getInstance().debug("Task::_sendHttpGet:task name is " + this._task_name +
                        " , api_name is " + test_case.api_name + ", result is " + response);
    }

    async execute() {
        try {
            for(let i in this._test_case_queue) {
                let test_case = this._test_case_queue[i];
                this._check(test_case);

                await this._sendHttpRequest(test_case);
            }
            Log.getInstance().info("Task:: " + this._task_name + " execute success!!!");
        } catch(e) {
            throw new TypeError("Task:: " + this._task_name + " execute fail!err_msg is " + e.message);
        }
    }
}

module.exports = Task;
