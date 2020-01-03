const TaskQueue = require("../middleware/taskqueue");
const Log = require("../middleware/log");
const Report = require("../middleware/report");
const Setting = require("../middleware/setting");

async function execute() {
    try {
        await Setting.getInstance().init();
        Log.initialize(Setting.getInstance().getSetting("log_level"));
        Report.initialize({
            report_path: Setting.getInstance().getSetting("report_path")
        });
        TaskQueue.initialize({
            temp_test_case_path: Setting.getInstance().getSetting("temp_test_case_path_in_mock_module"),
            report_module: Report.getInstance(),
            special_test_case_path: Setting.getInstance().getSetting("special_test_case_path_in_mock_module")
        });

        await TaskQueue.getInstance().loadTask();
        await TaskQueue.getInstance().loadSpecialTask();
        await TaskQueue.getInstance().execute();//记住判断一个流程中是否有不在loader过程中的，报错，这种一般是该api的测试用例没有生成
    } catch (e) {
        Log.getInstance().error(e.message);
    }
}

execute();
