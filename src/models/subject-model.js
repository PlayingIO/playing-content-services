import timestamps from 'mongoose-timestamp';
import { plugins } from 'mostly-feathers-mongoose';

const fields = {
  name: { type: 'String', required: true  },
  label: { type: 'String', required: true  },
  parent: { type: 'ObjectId' }
};

export default function(app, name) {
  const mongoose = app.get('mongoose');
  const schema = new mongoose.Schema(fields);
  schema.plugin(timestamps);
  schema.plugin(plugins.softDelete);
  schema.plugin(plugins.sortable, { classify: 'parent' });
  return mongoose.model(name, schema);
}