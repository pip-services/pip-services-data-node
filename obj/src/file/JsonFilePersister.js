"use strict";
var fs = require('fs');
var pip_services_commons_node_1 = require("pip-services-commons-node");
var pip_services_commons_node_2 = require("pip-services-commons-node");
var pip_services_commons_node_3 = require("pip-services-commons-node");
var pip_services_commons_node_4 = require("pip-services-commons-node");
var JsonFilePersister = (function () {
    function JsonFilePersister(path) {
        this.path = path;
    }
    Object.defineProperty(JsonFilePersister.prototype, "path", {
        get: function () {
            return this._path;
        },
        set: function (value) {
            this._path = value;
        },
        enumerable: true,
        configurable: true
    });
    JsonFilePersister.prototype.configure = function (config) {
        if (config == null || !("path" in config))
            throw new pip_services_commons_node_1.ConfigException(null, "NO_PATH", "Data file path is not set");
        this.path = config.getAsString("path");
    };
    JsonFilePersister.prototype.load = function (correlation_id) {
        if (!fs.existsSync(this.path))
            return [];
        try {
            var json = fs.readFileSync(this.path, "utf8");
            var list = pip_services_commons_node_3.JsonConverter.toNullableMap(json);
            return pip_services_commons_node_4.ArrayConverter.listToArray(list);
        }
        catch (ex) {
            throw new pip_services_commons_node_2.FileException(correlation_id, "READ_FAILED", "Failed to read data file: " + this.path).withCause(ex);
        }
    };
    JsonFilePersister.prototype.save = function (correlation_id, entities) {
        try {
            var json = pip_services_commons_node_3.JsonConverter.toJson(entities);
            fs.writeFileSync(this.path, json);
        }
        catch (ex) {
            throw new pip_services_commons_node_2.FileException(correlation_id, "WRITE_FAILED", "Failed to write data file: " + this.path).withCause(ex);
        }
    };
    return JsonFilePersister;
}());
exports.JsonFilePersister = JsonFilePersister;
//# sourceMappingURL=JsonFilePersister.js.map