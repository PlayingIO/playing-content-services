/**
 * File document
 */
const fields = {
};

module.exports = function model (app, name) {
  const mongoose = app.get('mongoose');
  const DocumentModel = mongoose.model('document');
  const schema = new mongoose.Schema(fields);
  return DocumentModel.discriminator(name, schema);
};
module.exports.schema = fields;