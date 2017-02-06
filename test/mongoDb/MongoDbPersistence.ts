let assert = require('chai').assert;

import { MongoDbPersistence } from '../../src/mongoDb/MongoDbPersistence';
import { Dummy } from '../Dummy';
import { ConfigParams } from 'pip-services-commons-node';

suite('MongoDbPersistence', ()=> {
    
    var db: MongoDbPersistence<Dummy, string>;
    var _dummy1: Dummy;
    var _dummy2: Dummy;

    beforeEach(function() {
        db = new MongoDbPersistence<Dummy, string>();
        db.configure(new ConfigParams());
        db.open(null);
        db.clear(null);

        _dummy1 = { id: null, key: "Key 1", content: "Content 1"};
        _dummy2 = { id: null, key: "Key 2", content: "Content 2"};
    });

    test('Crud Operations', () => {
        // Create one dummy
        var dummy1 = db.create(null, _dummy1);

        assert.isNotNull(dummy1);
        assert.isNotNull(dummy1.id);
        assert.equal(_dummy1.key, dummy1.key);
        assert.equal(_dummy1.content, dummy1.content);

        // Create another dummy
        var dummy2 = db.create(null, _dummy2);

        assert.isNotNull(dummy2);
        assert.isNotNull(dummy2.id);
        assert.equal(_dummy2.key, dummy2.key);
        assert.equal(_dummy2.content, dummy2.content);

        // Update the dummy
        dummy1.content = "Updated Content 1";
        var dummy = db.update(null, dummy1);

        assert.isNotNull(dummy);
        assert.equal(dummy1.id, dummy.id);
        assert.equal(dummy1.key, dummy.key);
        assert.equal(dummy1.content, dummy.content);

        // Delete the dummy
        db.deleteById(null, dummy1.id);

        // Try to get deleted dummy
        dummy = db.getOneById(null, dummy1.id);
        assert.isNull(dummy);
    });

});