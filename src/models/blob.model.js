import { plugins } from 'mostly-feathers-mongoose';
import { schemas } from 'playing-content-common';

const options = {
  timestamps: true
};

/**
 * Blob
 */
const fields = {
  blobs: [schemas.blob.schema],
};

export default function model (app, name) {
  const mongoose = app.get('mongoose');
  const schema = new mongoose.Schema(fields, options);
  schema.plugin(plugins.trashable);
  return mongoose.model(name, schema);
}

model.schema = fields;