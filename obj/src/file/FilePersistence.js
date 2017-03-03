"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const JsonFilePersister_1 = require("./JsonFilePersister");
const MemoryPersistence_1 = require("../memory/MemoryPersistence");
class FilePersistence extends MemoryPersistence_1.MemoryPersistence {
    constructor(persister) {
        if (persister == null)
            persister = new JsonFilePersister_1.JsonFilePersister();
        super(persister, persister);
        this._persister = persister;
    }
    configure(config) {
        this._persister.configure(config);
    }
}
exports.FilePersistence = FilePersistence;
//# sourceMappingURL=FilePersistence.js.map