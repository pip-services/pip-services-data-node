"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require('fs');
const pip_services_commons_node_1 = require("pip-services-commons-node");
const pip_services_commons_node_2 = require("pip-services-commons-node");
const pip_services_commons_node_3 = require("pip-services-commons-node");
const pip_services_commons_node_4 = require("pip-services-commons-node");
class JsonFilePersister {
    constructor(path) {
        this._path = path;
    }
    get path() {
        return this._path;
    }
    set path(value) {
        this._path = value;
    }
    configure(config) {
        this._path = config.getAsStringWithDefault("path", this._path);
    }
    load(correlation_id, callback) {
        if (this._path == null) {
            callback(new pip_services_commons_node_1.ConfigException(null, "NO_PATH", "Data file path is not set"), null);
            return;
        }
        if (!fs.existsSync(this._path)) {
            callback(null, []);
            return;
        }
        try {
            let json = fs.readFileSync(this._path, "utf8");
            let list = pip_services_commons_node_3.JsonConverter.toNullableMap(json);
            let arr = pip_services_commons_node_4.ArrayConverter.listToArray(list);
            callback(null, arr);
        }
        catch (ex) {
            let err = new pip_services_commons_node_2.FileException(correlation_id, "READ_FAILED", "Failed to read data file: " + this._path)
                .withCause(ex);
            callback(err, null);
        }
    }
    save(correlation_id, entities, callback) {
        try {
            let json = pip_services_commons_node_3.JsonConverter.toJson(entities);
            fs.writeFileSync(this._path, json);
            if (callback)
                callback(null);
        }
        catch (ex) {
            let err = new pip_services_commons_node_2.FileException(correlation_id, "WRITE_FAILED", "Failed to write data file: " + this._path)
                .withCause(ex);
            if (callback)
                callback(err);
            else
                throw err;
        }
    }
}
exports.JsonFilePersister = JsonFilePersister;
//# sourceMappingURL=JsonFilePersister.js.map