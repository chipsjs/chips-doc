const {publicInit} = require("../middleware/assist_macro");
const TaskQueue = require("../service/taskqueue");
const Log = require("../middleware/log");

async function execute() {
    try {
        await publicInit();

        await TaskQueue.getInstance().init();
        await TaskQueue.getInstance().execute();//记住判断一个流程中是否有不在loader过程中的，报错，这种一般是该api的测试用例没有生成
    } catch (e) {
        Log.getInstance().error(e.message);
    }
}

execute();
