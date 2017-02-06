var fs = require('fs');

import { IIdentifiable } from 'pip-services-commons-node';
import { IConfigurable } from 'pip-services-commons-node';
import { ConfigParams } from 'pip-services-commons-node';
import { ConfigException } from 'pip-services-commons-node';
import { FileException } from 'pip-services-commons-node';
import { JsonConverter } from 'pip-services-commons-node';
import { ArrayConverter } from 'pip-services-commons-node';

import { ILoader } from '../.';
import { ISaver } from '../.';

export class JsonFilePersister<T> implements ILoader<T>, ISaver<T>, IConfigurable {

    private _path: string;

    public get path(): string {
        return this._path;
    }

    public set path(value: string) {
        this._path = value;
    }

    public constructor(path?: string) {
        this.path = path;
    }

    public configure(config: ConfigParams): void {
        if (config == null || !("path" in config))
            throw new ConfigException(null, "NO_PATH", "Data file path is not set");

        this.path = config.getAsString("path");
    }

    public load(correlation_id: string): T[] {
        if (!fs.existsSync(this.path))
            return [];

        try {
            let json: any = fs.readFileSync(this.path, "utf8");
            var list = JsonConverter.toNullableMap(json);
            return ArrayConverter.listToArray(list);
        } catch (ex) {
            throw new FileException(correlation_id, "READ_FAILED", "Failed to read data file: " + this.path).withCause(ex);
        }
    }

    public save(correlation_id: string, entities: T[]): void {
        try {
            var json = JsonConverter.toJson(entities);
            fs.writeFileSync(this.path, json);
        } catch (ex) {
            throw new FileException(correlation_id, "WRITE_FAILED", "Failed to write data file: " + this.path).withCause(ex);
        }
    }

}
