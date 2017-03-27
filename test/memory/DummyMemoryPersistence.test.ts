import { ConfigParams } from 'pip-services-commons-node';
import { Dummy } from '../Dummy';
import { DummyPersistenceFixture } from '../DummyPersistenceFixture';
import { DummyMemoryPersistence } from './DummyMemoryPersistence';

suite('DummyMemoryPersistence', ()=> {    
    var persistence: DummyMemoryPersistence;
    var fixture: DummyPersistenceFixture;

    setup(() => {
        persistence = new DummyMemoryPersistence();
        persistence.configure(new ConfigParams());

        fixture = new DummyPersistenceFixture(persistence);
    });

    test('Crud Operations', (done) => {
        fixture.testCrudOperations(done);
    });

});