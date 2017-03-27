import { Schema } from "mongoose";

export let DummyMongoDbSchema = function(collection?: string): Schema {
    collection = collection || 'dummies';

    let schema: Schema = new Schema(
        {
            _id: { type: String, unique: true },
            key: { type: String, required: true },
            content: { type: String, required: false }
        },
        {
            collection: collection,
            autoIndex: true
        }
    );

    schema.set('toJSON', {
        transform: function (doc, ret) {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
            return ret;
        }
    });

    return schema;
}