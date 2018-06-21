/**
 * Folder document
 */
const fields = {
  color: { type: String },
  ordered: { type: Boolean, default: false }
};

export default function model (app, name) {
  const mongoose = app.get('mongoose');
  const DocumentModel = mongoose.model('document');
  const schema = new mongoose.Schema(fields);
  return DocumentModel.discriminator(name, schema);
}

model.schema = fields;