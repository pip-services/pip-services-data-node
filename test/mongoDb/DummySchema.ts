import { Schema } from "mongoose";

export let DummySchema: Schema = new Schema(
    {
        _id: { type: String, unique: true },
        key: { type: String, required: true },
        content: { type: String, required: false }
    },
    {
        collection: 'dummies',
        autoIndex: true
    }
);

DummySchema.set('toJSON', {
    transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
    }
});
