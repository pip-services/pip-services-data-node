import { IConfigurable } from 'pip-services-commons-node';
import { ConfigParams } from 'pip-services-commons-node';
import { ILoader } from '../ILoader';
import { ISaver } from '../ISaver';
export declare class JsonFilePersister<T> implements ILoader<T>, ISaver<T>, IConfigurable {
    private _path;
    constructor(path?: string);
    path: string;
    configure(config: ConfigParams): void;
    load(correlation_id: string, callback: (err: any, data: T[]) => void): void;
    save(correlation_id: string, entities: T[], callback?: (err: any) => void): void;
}
