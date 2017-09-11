import { IReferenceable } from 'pip-services-commons-node';
import { IReferences } from 'pip-services-commons-node';
import { IConfigurable } from 'pip-services-commons-node';
import { ConfigParams } from 'pip-services-commons-node';
import { ConnectionResolver } from 'pip-services-commons-node';
import { CredentialResolver } from 'pip-services-commons-node';
export declare class MongoDbConnectionResolver implements IReferenceable, IConfigurable {
    protected _connectionResolver: ConnectionResolver;
    protected _credentialResolver: CredentialResolver;
    setReferences(references: IReferences): void;
    configure(config: ConfigParams): void;
    private validateConnection(correlationId, connection);
    private validateConnections(correlationId, connections);
    private composeUri(connections, credential);
    resolve(correlationId: string, callback: (err: any, uri: string) => void): void;
}
