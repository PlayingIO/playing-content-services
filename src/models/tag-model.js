import timestamps from 'mongoose-timestamp';
import { plugins } from 'mostly-feathers-mongoose';

const fields = {
  id: { type: 'String', required: true  }, // lowercase label
  label: { type: 'String', required: true  }
};

export default function(app, name) {
  const mongoose = app.get('mongoose');
  const schema = new mongoose.Schema(fields);
  schema.plugin(timestamps);
  return mongoose.model(name, schema);
}