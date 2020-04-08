class Base {
    static initProperty(options) {
        const { written_properties, read_only_properties } = options;

        let declare = this;
        if (typeof written_properties === "object") {
            declare = Object.entries(written_properties).reduce(
                (prev, [key, value]) => {
                    this.prototype[key] = function (new_value) {
                        if (typeof new_value !== "undefined") {
                            value = new_value;
                        }
                        return value;
                    };

                    return this;
                },
                declare
            );
        }

        if (typeof read_only_properties === "object") {
            declare = Object.entries(read_only_properties).reduce(
                (prev, [key, value]) => {
                    this.prototype[key] = function () {
                        return value;
                    };

                    return this;
                }, declare
            );
        }

        return declare;
    }

    static factory() {
        let instance;

        return class extends this {
            static loadInstance(options) {
                if (!instance) {
                    Base.initProperty.call(this, options);
                    instance = new this();
                }
                return instance;
            }

            static getInstance() {
                if (!instance) {
                    throw new TypeError("The instance: " + this.name + " is not initialized!!");

                }
                return instance;
            }
        };
    }
}
module.exports = Base;