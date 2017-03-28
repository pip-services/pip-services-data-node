import { Schema } from 'mongoose';
import { YamlConfigReader } from 'pip-services-commons-node';
import { ConfigParams } from 'pip-services-commons-node';
import { Dummy } from '../Dummy';
import { DummyPersistenceFixture } from '../DummyPersistenceFixture';
import { DummyMongoDbPersistence } from './DummyMongoDbPersistence';

suite('DummyMongoDbPersistence', ()=> {
    let persistence: DummyMongoDbPersistence;
    let fixture: DummyPersistenceFixture;

    setup((done) => {
        let config = YamlConfigReader.readConfig(null, './config/test_connections.yaml');
        let dbConfig = config.getSection('mongodb');

        persistence = new DummyMongoDbPersistence();
        persistence.configure(dbConfig);

        fixture = new DummyPersistenceFixture(persistence);

        persistence.open(null, (err: any) => {
            persistence.clear(null, (err) => {
                done(err);
            });
        });
    });

    test('Crud Operations', (done) => {
        fixture.testCrudOperations(done);
    });

});