import { plugins } from 'mostly-feathers-mongoose';
import { blob } from './blob.schema';

const options = {
  timestamps: true
};

const fields = {
  blobs: [blob],
};

export default function model (app, name) {
  const mongoose = app.get('mongoose');
  const schema = new mongoose.Schema(fields, options);
  schema.plugin(plugins.softDelete);
  return mongoose.model(name, schema);
}

model.schema = blob;