import timestamps from 'mongoose-timestamp';
import uniqueArray from 'mongoose-unique-array';
import { plugins } from 'mostly-feathers-mongoose';
import { blob, blobs } from './blob-schema';

const options = {
  discriminatorKey: 'type'
};

/**
 * Loosely based on the dublincore DCMI schema
 * http://dublincore.org/documents/dcmi-terms/
 */
const fields = {
  title: { type: 'String', required: true },  // name given to the resource
  description: { type: 'String' },            // description of the resource.
  parent: { type: 'ObjectId' },               // parent resource
  path: { type: 'String', default: '/', unique: true },
  subjects: [{ type: 'String' }],             // the topic of the resource
  tags: [{ type: 'String' }],                 // the tags of the resource
  rights: [{ type: 'String' }],               // information about rights held in and over the resource.
  source: { type: 'String' },                 // related resource from which the described resource is derived.
  nature: { type: 'String' },                 // nature or genre of the resource
  coverage: { type: 'String' },               // spatial or temporal topic of the resource
  issued: { type: 'Date' },                   // date issued
  valid: { type: 'Date' },                    // start date of validity of a resource
  expired: { type: 'Date' },                  // end date of validity of a resource
  format: { type: 'String' },                 // file format, physical medium, or dimensions of the resource.
  language: { type: 'String' },               // language of the resource.
  author: { type: 'String' },                 // real author of the document
  creator: { type: 'ObjectId' },              // creator of the document
  contributors: [{ type: 'ObjectId' }],       // contributor of the document
  file: blob,                                 // main blob of the resource
  files: blobs,                               // attachements of the resource
  verion: { type: 'Number' },                 // version of the resource
  locker: { type: 'ObjectId' },               // lock owner
  lockedAt: { type: 'Date' }                  // locked time
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
