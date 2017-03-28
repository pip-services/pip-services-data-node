var fs = require('fs');

import { IIdentifiable } from 'pip-services-commons-node';
import { IConfigurable } from 'pip-services-commons-node';
import { ConfigParams } from 'pip-services-commons-node';
import { ConfigException } from 'pip-services-commons-node';
import { FileException } from 'pip-services-commons-node';
import { JsonConverter } from 'pip-services-commons-node';
import { ArrayConverter } from 'pip-services-commons-node';

import { ILoader } from '../ILoader';
import { ISaver } from '../ISaver';

export class JsonFilePersister<T> implements ILoader<T>, ISaver<T>, IConfigurable {
    private _path: string;

    public constructor(path?: string) {
        this._path = path;
    }

    public get path(): string {
        return this._path;
    }

    public set path(value: string) {
        this._path = value;
    }

    public configure(config: ConfigParams): void {
        this._path = config.getAsStringWithDefault("path", this._path);
    }

    public load(correlation_id: string, callback: (err: any, data: T[]) => void): void {
        if (this._path == null) {
            callback(new ConfigException(null, "NO_PATH", "Data file path is not set"), null);
            return;
        }

        if (!fs.existsSync(this._path)) {
            callback(null, []);
            return;
        }

        try {
            let json: any = fs.readFileSync(this._path, "utf8");
            let list = JsonConverter.toNullableMap(json);
            let arr = ArrayConverter.listToArray(list);

            callback(null, arr);
        } catch (ex) {
            let err = new FileException(correlation_id, "READ_FAILED", "Failed to read data file: " + this._path)
                .withCause(ex);

            callback(err, null);
        }
    }

    public save(correlation_id: string, entities: T[], callback?: (err: any) => void): void {
        try {
            let json = JsonConverter.toJson(entities);
            fs.writeFileSync(this._path, json);
            if (callback) callback(null);
        } catch (ex) {
            let err = new FileException(correlation_id, "WRITE_FAILED", "Failed to write data file: " + this._path)
                .withCause(ex);

            if (callback) callback(err);
            else throw err;
        }
    }

}
