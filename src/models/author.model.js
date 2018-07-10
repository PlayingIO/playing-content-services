const options = {
  timestamps: true
};

/**
 * Author
 */
const fields = {
  id: { type: String, required: true  }, // lowercase label
  label: { type: String, required: true  }
};

module.exports = function model (app, name) {
  const mongoose = app.get('mongoose');
  const schema = new mongoose.Schema(fields, options);
  return mongoose.model(name, schema);
};
module.exports.schema = fields;