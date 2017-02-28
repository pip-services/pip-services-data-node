"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const IdentifiableMemoryPersistence_1 = require("../memory/IdentifiableMemoryPersistence");
const JsonFilePersister_1 = require("./JsonFilePersister");
class IdentifiableFilePersistence extends IdentifiableMemoryPersistence_1.IdentifiableMemoryPersistence {
    constructor(persister) {
        if (persister == null)
            persister = new JsonFilePersister_1.JsonFilePersister();
        super(persister, persister);
        this._persister = persister;
    }
    configure(config) {
        super.configure(config);
        this._persister.configure(config);
    }
}
exports.IdentifiableFilePersistence = IdentifiableFilePersistence;
//# sourceMappingURL=IdentifiableFilePersistence.js.map