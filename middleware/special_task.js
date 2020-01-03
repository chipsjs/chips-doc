const {httpRequest, dataValidate} = require("../lib/assist_macro");
const {header, base_url} = require("../api_dependence.json");
//to optimize

class SpecialTask {
    constructor(task_name, task_info, log_module) {
        this._task_name = task_name;
        this._task_info = task_info;
        this._logger = log_module;
    }

    _joinQueryField(query) {
        let str = "";
        for(let i in query) {
            str += (i + "=" + query[i] + "&");
        }
        return str.substr(0, str.length - 1);
    }

    _replaceUrl(url) {
        return url.replace("${base_url}", base_url);
    }

    async _sendHttpRequest(method_type, url, test_case) {
        if(typeof test_case.query === "object") {
            url += "?" + this._joinQueryField(test_case.query);
        }

        let response = {};
        switch (method_type) {
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
                throw new TypeError("SpecialTask::sendHttpRequest: fail! task name is " + this._task_name) + ". It has unsupported method_type";
        }

        //response check
        if(response.statusCode === 200) {
            //context overwrite
            let response_body = JSON.parse(response.body);

            if(typeof test_case.response === "object" && test_case.response.success === "object") {
                let result = dataValidate(response_body, test_case.response.success);
                if(Array.isArray(result.errors) && result.errors.length !== 0) throw new TypeError(result.errors.toString());
            }
        } else {
            if(typeof test_case.response === "object" && test_case.response.failure === "object") {
                let result = dataValidate(JSON.parse(response.body), test_case.response.failure);
                if(Array.isArray(result.errors) && result.errors.length !== 0) throw new TypeError(result.errors.toString());
            }
        }

        this._logger.debug("SpecialTask::_sendHttpGet:task name is " + this._task_name +
            " , api_name is " + test_case.api_name + ", result is " + response.body);
    }

    async execute() {
        try {
            for(let i in this._task_info.cases) {
                let test_case = this._task_info.cases[i];
                let url = this._replaceUrl(this._task_info.url);
                await this._sendHttpRequest(this._task_info.method_type, url, test_case);
            }

            return {
                msg: "SpecialTask:: [" + this._task_name + "] execute success!!!",
                success_flag: true
            };
        } catch(e) {
            return {
                msg: "SpecialTask:: [" + this._task_name + "] execute fail!err_msg is " + e.message,
                isSuccess: false
            };
        }
    }
}

module.exports = SpecialTask;
