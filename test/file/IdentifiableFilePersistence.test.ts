let assert = require('chai').assert;
var async = require('async');

import { IdentifiableFilePersistence } from '../../src/file/IdentifiableFilePersistence';
import { Dummy } from '../Dummy';
import { ConfigParams } from 'pip-services-commons-node';

suite('IdentifiableFilePersistence', ()=> {
    
    var db: IdentifiableFilePersistence<Dummy, string>;
    var _dummy1: Dummy;
    var _dummy2: Dummy;

    setup(function() {
        let fileName: string = "./data/dummies.json";

        db = new IdentifiableFilePersistence<Dummy, string>();
        db.configure(ConfigParams.fromTuples("path", fileName));
        db.open(null);
        db.clear(null);

        _dummy1 = { id: null, key: "Key 1", content: "Content 1"};
        _dummy2 = { id: null, key: "Key 2", content: "Content 2"};
    });

    test('Crud Operations', (done) => {
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

                    callback(err);
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

                    callback(err);
                });
            },
            (callback) => {
                // Update the dummy
                dummy1.content = "Updated Content 1";
                db.update(null, dummy1, (err: any, result: Dummy) => {
                    assert.isNotNull(result);
                    assert.equal(dummy1.id, result.id);
                    assert.equal(dummy1.key, result.key);
                    assert.equal(dummy1.content, result.content);

                    callback(err);
                });
            },
            (callback) => {
                // Get the dummy by Id
                db.getOneById(null, dummy1.id, (err: any, result: Dummy) => {
                    // Try to get item
                    assert.isNotNull(result);
                    assert.equal(dummy1.id, result.id);
                    assert.equal(dummy1.key, result.key);
                    assert.equal(dummy1.content, result.content);

                    callback(err);
                });
            },
            (callback) => {
                // Delete the dummy
                db.deleteById(null, dummy1.id, (err: any, result: Dummy) => {
                    assert.isNotNull(result);
                    assert.equal(dummy1.id, result.id);
                    assert.equal(dummy1.key, result.key);
                    assert.equal(dummy1.content, result.content);

                    callback(err);
                });
            },
            (callback) => {
                // Get the deleted dummy
                db.getOneById(null, dummy1.id, (err: any, result: Dummy) => {
                    // Try to get item
                    assert.isNull(result);

                    callback(err);
                });
            }
        ], (err) => {
            done();
        });
    });

});