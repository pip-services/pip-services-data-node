let assert = require('chai').assert;
var async = require('async');

import { MongoDbPersistence } from '../../src/mongoDb/MongoDbPersistence';
import { Dummy } from '../Dummy';
import { ConfigParams } from 'pip-services-commons-node';
import { Schema } from 'mongoose';

suite.only('MongoDbPersistence', ()=> {
    
    var db: MongoDbPersistence<Dummy, string>;
    var _dummy1: Dummy;
    var _dummy2: Dummy;

    beforeEach(function(done) {
        db = new MongoDbPersistence<Dummy, string>("dummies", new Schema());
        db.configure(ConfigParams.fromTuples(
            "connection.type", "mongodb",
            "connection.database", "test",
            "connection.uri", ""
        ));
        db.open(null, (err: any) => {
            db.clear(null);

            _dummy1 = { id: null, key: "Key 1", content: "Content 1"};
            _dummy2 = { id: null, key: "Key 2", content: "Content 2"};

            done(err);
        });
    });

    test('Crud Operations', () => {
        let dummy1: Dummy;
        let dummy2: Dummy;

        async.series([
            (callback) => {
                // Create one dummy
                db.create(null, _dummy1, (err: any, result: Dummy) => {
                    dummy1 = result;
                    assert.isNotNull(dummy1);
                    assert.isNotNull(dummy1.id);
                    assert.equal(_dummy1.key, dummy1.key);
                    assert.equal(_dummy1.content, dummy1.content);
                });
            },
            (callback) => {
                // Create another dummy
                db.create(null, _dummy2, (err: any, result: Dummy) => {
                    dummy2 = result;
                    assert.isNotNull(dummy2);
                    assert.isNotNull(dummy2.id);
                    assert.equal(_dummy2.key, dummy2.key);
                    assert.equal(_dummy2.content, dummy2.content);
                });
            },
            (callback) => {
                // Update the dummy
                dummy1.content = "Updated Content 1";
                db.update(null, dummy1, (err: any, result: Dummy) => {
                    var dummy = result;
                    assert.isNotNull(dummy);
                    assert.equal(dummy1.id, dummy.id);
                    assert.equal(dummy1.key, dummy.key);
                    assert.equal(dummy1.content, dummy.content);
                });
            },
            (callback) => {
                // Delete the dummy
                db.deleteById(null, dummy1.id, (err: any, result: Dummy) => {
                    // Try to get deleted dummy
                    var dummy = db.getOneById(null, dummy1.id);
                    assert.isNull(dummy);
                });
            }
        ], (err) => {
        });
    });

});