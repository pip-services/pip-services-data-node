"use strict";
var fs = require('fs');
const pip_services_commons_node_1 = require("pip-services-commons-node");
const pip_services_commons_node_2 = require("pip-services-commons-node");
const pip_services_commons_node_3 = require("pip-services-commons-node");
const pip_services_commons_node_4 = require("pip-services-commons-node");
class JsonFilePersister {
    constructor(path) {
        this.path = path;
    }
    get path() {
        return this._path;
    }
    set path(value) {
        this._path = value;
    }
    configure(config) {
        if (config == null || !("path" in config))
            throw new pip_services_commons_node_1.ConfigException(null, "NO_PATH", "Data file path is not set");
        this.path = config.getAsString("path");
    }
    load(correlation_id) {
        if (!fs.existsSync(this.path))
            return [];
        try {
            let json = fs.readFileSync(this.path, "utf8");
            var list = pip_services_commons_node_3.JsonConverter.toNullableMap(json);
            return pip_services_commons_node_4.ArrayConverter.listToArray(list);
        }
        catch (ex) {
            throw new pip_services_commons_node_2.FileException(correlation_id, "READ_FAILED", "Failed to read data file: " + this.path).withCause(ex);
        }
    }
    save(correlation_id, entities) {
        try {
            var json = pip_services_commons_node_3.JsonConverter.toJson(entities);
            fs.writeFileSync(this.path, json);
        }
        catch (ex) {
            throw new pip_services_commons_node_2.FileException(correlation_id, "WRITE_FAILED", "Failed to write data file: " + this.path).withCause(ex);
        }
    }
}
exports.JsonFilePersister = JsonFilePersister;
//# sourceMappingURL=JsonFilePersister.js.map