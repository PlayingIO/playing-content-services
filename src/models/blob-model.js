import timestamps from 'mongoose-timestamp';
import { plugins } from 'mostly-feathers-mongoose';
import { blob } from './blob-schema';

const fields = {
  blobs: [blob],
};

export default function model (app, name) {
  const mongoose = app.get('mongoose');
  const schema = new mongoose.Schema(fields);
  schema.plugin(timestamps);
  schema.plugin(plugins.softDelete);
  return mongoose.model(name, schema);
}

model.schema = blob;