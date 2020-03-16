const Base = require("../../lib/base_class");

class SpecConvert extends Base.factory() {
    constructor() {
        super();
    }

    static initialize({log_module}) {
        this.loadInstance({
            read_only_properties: {
                logger: log_module || console
            }
        });
    }

    run(version, output_path) {

    }

}

module.exports = Loader;