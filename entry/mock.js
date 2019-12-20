const {publicInit} = require("../middleware/init");
const TaskQueue = require("../service/taskqueue");

async function init() {
    await publicInit();

    await TaskQueue.getInstance().init();
    await TaskQueue.getInstance().execute();
}

init();
