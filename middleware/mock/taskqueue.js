const Task = require("./task");
const SpecialTask = require("./special_task");
const Base = require("../../lib/base_class");
const api_flow_json = require("../../api_flow.json");

class TaskQueue extends Base.factory(){
    constructor() {
        super();
        this._queue = [];
        this._special_queue = [];
    }

    static initialize({log_module, report_module, temp_test_case_path, special_test_case_path}) {
        this.loadInstance({
            read_only_properties: {
                logger: log_module || console,
                temp_test_case_path: temp_test_case_path,
                report: report_module || console,
                special_test_case_path: special_test_case_path
            }
        });
    }

    loadSpecialTask() {
        let special_test_case_json = require(this.special_test_case_path());

        Object.keys(special_test_case_json).forEach(ele => {
            if(typeof ele !== "string" || !Array.isArray(special_test_case_json[ele].cases) || typeof special_test_case_json[ele].method_type !== "string" || typeof special_test_case_json[ele].method_type !== "string")
                throw new TypeError("TaskQueue::init:special test case - " + i + " parse error.please check key and value in special.json;");

            let special_task = new SpecialTask(ele, special_test_case_json[ele], this.logger());
            this._special_queue.push(special_task);
        })
    }

    loadTask() {
        let test_case_flow_json = require(this.temp_test_case_path());

        Object.keys(test_case_flow_json).forEach( ele => {
            if(typeof ele !== "string" || !Array.isArray(test_case_flow_json[ele])) throw new TypeError("TaskQueue::init: test case - " + i + " parse error.please check key and value in test_case.js;it must be promised key is string and value is array");

            let task =  new Task(ele, test_case_flow_json[ele], api_flow_json[ele].context || [],  this.logger());
            this._queue.push(task);
        });
    }

    async execute() {
        for(let i in this._queue) {
            let result = await this._queue[i].execute();
            this.report().addReport(result);
        }

        for(let i in this._special_queue) {
            let result = await this._special_queue[i].execute();
            this.report().addReport(result);
        }
    }
}

module.exports = TaskQueue;

//加载任务，加载公用数据到loader中