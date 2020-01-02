const {httpRequest, dataValidate} = require("../lib/assist_macro");
const header = require("../api_dependence.json").header;

class Task {
    constructor(task_name, test_case_queue, log_module) {
        this._task_name = task_name;
        this._test_case_queue = test_case_queue;
        this._logger = log_module;
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

    async _sendHttpRequest(test_case) {
        let url = test_case.url;

        if(typeof test_case.query === "object") {
            url += "?" + this._joinQueryField(test_case.query);
        }

        let response = {};
        switch (test_case.method_type) {
            case "get":
                response = await httpRequest.get({
                    url: url,
                    headers: header
                });
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

        if(response.statusCode === 200) {
            let result = dataValidate(JSON.parse(response.body), test_case.response);
            if(Array.isArray(result.errors) && result.errors.length !== 0) throw new TypeError(result.errors.toString());
        }
        //todo，statusCode other的处理

        this._logger().debug("Task::_sendHttpGet:task name is " + this._task_name +
                        " , api_name is " + test_case.api_name + ", result is " + response.body);
    }

    async execute() {
        try {
            for(let i in this._test_case_queue) {
                let test_case = this._test_case_queue[i];
                this._check(test_case);

                await this._sendHttpRequest(test_case);
            }

            //do, task_prefix
            return {
                msg: "Task:: [" + this._task_name + "] execute success!!!",
                success_flag: true
            };
        } catch(e) {
            return {
                msg: "Task:: [" + this._task_name + "] execute fail!err_msg is " + e.message,
                isSuccess: false
            };
        }
    }
}

module.exports = Task;
