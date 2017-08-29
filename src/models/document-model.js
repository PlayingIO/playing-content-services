import timestamps from 'mongoose-timestamp';
import uniqueArray from 'mongoose-unique-array';
import { plugins } from 'mostly-feathers-mongoose';
import { blob, blobs } from './blob-schema';

const options = {
  discriminatorKey: 'type'
};

const fields = {
  title: { type: 'String', required: true },
  description: { type: 'String' },
  parent: { type: 'ObjectId' },
  path: { type: 'String', default: '/', unique: true },
  subjects: [{ type: 'String' }],
  tags: [{ type: 'String', unique: true }],
  rights: [{ type: 'String' }],
  source: { type: 'String' },
  nature: { type: 'String' },
  coverage: { type: 'String' },
  issued: { type: 'Date' },
  valid: { type: 'Date' },
  expired: { type: 'Date' },
  format: { type: 'String' },
  language: { type: 'String' },
  author: { type: 'String' },    // real author of the document
  creator: { type: 'ObjectId' }, // creator of the document
  contributors: [{ type: 'ObjectId' }], // contributor of the document
  file: blob,   // main blob
  files: blobs, // attachements
  verion: { type: 'Number' },
  locker: { type: 'ObjectId' },  // lock owner
  lockedAt: { type: 'Date' }     // locked time
};

export default function(app, name) {
  const mongoose = app.get('mongoose');
  const schema = new mongoose.Schema(fields, options);
  schema.plugin(timestamps);
  schema.plugin(uniqueArray);
  schema.plugin(plugins.softDelete);
  schema.plugin(plugins.acl);
  return mongoose.model(name, schema);
}
