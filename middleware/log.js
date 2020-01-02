const log4js = require('log4js');
const Base = require("../lib/base_class");

class Log extends Base.factory(){
    static initialize(log_level) {
        let logger = log4js.getLogger();
        logger.level = log_level;

        this.loadInstance({
            read_only_properties: {
                logger: logger
            }
        });
    }

    error(msg) {
        this.logger().error(msg);
    }
    info(msg) {
        this.logger().info(msg);
    };

    debug(msg) {
        this.logger().debug(msg);
    };
}

module.exports = Log;