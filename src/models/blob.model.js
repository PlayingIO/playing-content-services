const { plugins } = require('mostly-feathers-mongoose');
const { schemas } = require('playing-content-common');

const options = {
  timestamps: true
};

/**
 * Blob
 */
const fields = {
  blobs: [schemas.blob.schema],
};

module.exports = function model (app, name) {
  const mongoose = app.get('mongoose');
  const schema = new mongoose.Schema(fields, options);
  schema.plugin(plugins.trashable);
  return mongoose.model(name, schema);
};
module.exports.schema = fields;