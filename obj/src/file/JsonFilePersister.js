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
    load(correlation_id, callback) {
        if (!fs.existsSync(this.path)) {
            callback(new pip_services_commons_node_2.FileException(correlation_id, "NOT_FOUND", "File not found: " + this.path), []);
            return;
        }
        try {
            let json = fs.readFileSync(this.path, "utf8");
            var list = pip_services_commons_node_3.JsonConverter.toNullableMap(json);
            var arr = pip_services_commons_node_4.ArrayConverter.listToArray(list);
            callback(null, arr);
        }
        catch (ex) {
            var err = new pip_services_commons_node_2.FileException(correlation_id, "READ_FAILED", "Failed to read data file: " + this.path)
                .withCause(ex);
            callback(err, null);
        }
    }
    save(correlation_id, entities, callback) {
        try {
            var json = pip_services_commons_node_3.JsonConverter.toJson(entities);
            fs.writeFileSync(this.path, json);
            if (callback)
                callback();
        }
        catch (ex) {
            var err = new pip_services_commons_node_2.FileException(correlation_id, "WRITE_FAILED", "Failed to write data file: " + this.path)
                .withCause(ex);
            if (callback) {
                callback(err);
            }
            else {
                throw err;
            }
        }
    }
}
exports.JsonFilePersister = JsonFilePersister;
//# sourceMappingURL=JsonFilePersister.js.map