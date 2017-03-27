import { ConfigParams } from 'pip-services-commons-node';
import { Dummy } from '../Dummy';
import { DummyPersistenceFixture } from '../DummyPersistenceFixture';
import { DummyFilePersistence } from './DummyFilePersistence';

suite('DummyFilePersistence', ()=> {    
    let persistence: DummyFilePersistence;
    let fixture: DummyPersistenceFixture;
 
    setup(function() {
        persistence = new DummyFilePersistence();
        persistence.configure(ConfigParams.fromTuples(
            "path", "./data/dummies.json"
        ));

        fixture = new DummyPersistenceFixture(persistence);

        persistence.open(null);
        persistence.clear(null);
    });

    test('Crud Operations', (done) => {
        fixture.testCrudOperations(done);
    });

});