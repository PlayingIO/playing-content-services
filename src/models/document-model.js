import uniqueArray from 'mongoose-unique-array';
import { plugins } from 'mostly-feathers-mongoose';
import { blob } from './blob-schema';

const options = {
  timestamps: true,
  discriminatorKey: 'type'
};

/**
 * Loosely based on the dublincore DCMI schema
 * http://dublincore.org/documents/dcmi-terms/
 */
const fields = {
  authors: [{ type: String }],              // real author of the document
  contributors: [{ type: 'ObjectId' }],     // contributor of the document
  coverage: { type: String },               // spatial or temporal topic of the resource
  creator: { type: 'ObjectId' },            // creator of the document
  description: { type: String },            // description of the resource.
  expiredAt: { type: Date },                // end date of validity of a resource
  file: blob,                               // main blob of the resource
  files: [blob],                            // attachements of the resource
  format: { type: String },                 // file format, physical medium, or dimensions of the resource.
  issuedAt: { type: Date },                 // date issued
  language: { type: String },               // language of the resource.
  locker: { type: 'ObjectId' },             // lock owner
  lockedAt: { type: Date },                 // locked time
  nature: { type: String },                 // nature or genre of the resource
  parent: { type: 'ObjectId' },             // parent resource
  path: { type: String, default: '/', unique: true },
  rights: [{ type: String }],               // information about rights held in and over the resource.
  source: { type: String },                 // related resource from which the described resource is derived.
  state: { type: String },                  // lifecycle of the document: project, approved, obsolete and deleted
  subjects: [{ type: String }],             // the topic of the resource
  tags: [{ type: String }],                 // the tags of the resource
  title: { type: String, required: true },  // name given to the resource
  valid: { type: Date },                    // start date of validity of a resource
  version: { type: Number },                // version of the resource
};

export default function model (app, name) {
  const mongoose = app.get('mongoose');
  const schema = new mongoose.Schema(fields, options);
  schema.plugin(uniqueArray);
  schema.plugin(plugins.softDelete);
  schema.plugin(plugins.acl);
  return mongoose.model(name, schema);
}

model.schema = fields;
