import { plugins } from 'mostly-feathers-mongoose';
import { blob } from './blob.schema';

const fields = {
  content: { type: String, default: '' },
  mimetype: { type: String }
};

export default function model (app, name) {
  const mongoose = app.get('mongoose');
  const DocumentModel = mongoose.model('document');
  const schema = new mongoose.Schema(fields);
  return DocumentModel.discriminator(name, schema);
}

model.schema = fields;