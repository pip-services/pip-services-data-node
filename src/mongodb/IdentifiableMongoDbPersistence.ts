var async = require('async');

import { IIdentifiable } from 'pip-services-commons-node';
import { IStringIdentifiable } from 'pip-services-commons-node';
import { ObjectWriter } from 'pip-services-commons-node';
import { IdGenerator } from 'pip-services-commons-node';

import { Document, Model, Schema } from "mongoose";

import { MongoDbPersistence } from './MongoDbPersistence';
import { IWriter, IGetter, ISetter } from '../.';

export class IdentifiableMongoDbPersistence<T extends IIdentifiable<K>, K> extends MongoDbPersistence<T> 
    implements IWriter<T, K>, IGetter<T, K>, ISetter<T> {

    public constructor(collectionName: string, schema: Schema) {
        super(collectionName, schema);
    }

    public getOneById(correlationId: string, id: K, callback: (err: any, item: T) => void): void {
        this._model.findById(id, (err, item) => {
            if (!err)
                this._logger.trace(correlationId, "Retrieved from {0} with id = {1}", this._collectionName, id);

            item = this.jsonToPublic(item);
            callback(err, item);
        });
    }

    public create(correlationId: string, item: T, callback?: (err: any, item: T) => void): void {
        if (item == null) {
            callback(null, null);
            return;
        }

        if (item.id == null)
            ObjectWriter.setProperty(item, "id", IdGenerator.nextLong());

        (item as any)._id = item.id;

        this._model.create(item, (err, newItem) => {
            if (!err)
                this._logger.trace(correlationId, "Created in {0} with id = {1}", this._collectionName, newItem.id);

            newItem = this.jsonToPublic(newItem);
            callback(err, newItem);
        });
    }

    public set(correlationId: string, item: T, callback?: (err: any, item: T) => void): void {
        if (item == null) {
            if (callback) callback(null, null);
            return;
        }

        if (item.id == null)
            ObjectWriter.setProperty(item, "id", IdGenerator.nextLong());

        (item as any)._id = item.id;

        let filter = {
            id: item.id
        };

        let options = {
            new: true,
            upsert: true
        };
        
        this._model.findOneAndUpdate(filter, item, options, (err, newItem) => {
            if (!err)
                this._logger.trace(correlationId, "Set in {0} with id = {1}", this._collectionName, item.id);
           
            if (callback) {
                newItem = this.jsonToPublic(newItem);
                callback(err, newItem);
            }
        });
    }

    public update(correlationId: string, item: T, callback?: (err: any, item: T) => void): void {
        if (item == null || item.id == null) {
            if (callback) callback(null, null);
            return;
        }

        var options = {
            new: true
        };

        this._model.findByIdAndUpdate(item.id, item, options, (err, newItem) => {
            if (!err)
                this._logger.trace(correlationId, "Update in {0} with id = {1}", this._collectionName, item.id);

            if (callback) {
                newItem = this.jsonToPublic(newItem);
                callback(err, newItem);
            }
        });
    }

    public deleteById(correlationId: string, id: K, callback?: (err: any, item: T) => void): void {
        this._model.findByIdAndRemove(id, (err, oldItem) => {
            if (!err)
                this._logger.trace(correlationId, "Deleted from {0} with id = {1}", this._collectionName, id);

            if (callback) {
                oldItem = this.jsonToPublic(oldItem);
                callback(err, oldItem);
            }
        });
    }

}
