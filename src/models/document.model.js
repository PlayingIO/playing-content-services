const { plugins } = require('mostly-feathers-mongoose');
const { schemas } = require('playing-content-common');

const options = {
  timestamps: true,
  discriminatorKey: 'type'
};

/**
 * Loosely based on the dublincore DCMI schema
 * http://dublincore.org/documents/dcmi-terms/
 */
const fields = {
  authors: [{ type: String }],                 // real author of the document
  contributors: [{ type: 'ObjectId' }],        // contributor of the document
  coverage: { type: String },                  // spatial or temporal topic of the resource
  creator: { type: 'ObjectId' },               // creator of the document
  description: { type: String },               // description of the resource.
  expiredAt: { type: Date },                   // end date of validity of a resource
  file: schemas.blob.schema,                   // main blob of the resource
  files: [schemas.blob.schema],                // attachements of the resource
  format: { type: String },                    // file format, physical medium, or dimensions of the resource.
  issuedAt: { type: Date },                    // date issued
  language: { type: String },                  // language of the resource.
  locker: { type: 'ObjectId' },                // lock owner
  lockedAt: { type: Date },                    // locked time
  nature: { type: String },                    // nature or genre of the resource
  ancestors: [{ type: 'String' }],             // array of typed ids of ancestors
  parent: { type: 'ObjectId' },                // parent resource
  inherited: { type: Boolean, default: true }, // inherite permission from parent
  path: { type: String, default: '/', unique: true }, // path to the document
  rights: [{ type: String }],                  // information about rights held in and over the resource.
  source: { type: String },                    // related resource from which the described resource is derived.
  state: { type: String, enum: [               // lifecycle of the document
    'project', 'approved', 'obsolete', 'deleted'
  ]},
  subjects: [{ type: String }],                // the topic of the resource
  tags: [{ type: String }],                    // the tags of the resource
  type: { type: String, default: 'document' }, // discriminator key
  title: { type: String, required: true },     // name given to the resource
  valid: { type: Date },                       // start date of validity of a resource
  version: { type: Number },                   // version of the resource
};

module.exports = function model (app, name) {
  const mongoose = app.get('mongoose');
  const schema = new mongoose.Schema(fields, options);
  schema.plugin(plugins.trashable);
  schema.plugin(plugins.sortable, { classify: 'parent', trash: 'destroyedAt' });
  schema.index({ parent: 1 });
  schema.index({ path: 1 });
  schema.index({ ancestors: 1 });
  return mongoose.model(name, schema);
};
module.exports.schema = fields;
