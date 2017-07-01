import mongoose from 'mongoose';
import timestamps from 'mongoose-timestamp';
import { plugins } from 'mostly-feathers-mongoose';

const TagSchema = new mongoose.Schema({
  name: { type: 'String', required: true  },
  label: { type: 'String', required: true  }
});

TagSchema.plugin(timestamps);
TagSchema.plugin(plugins.softDelete);

const TagModel = mongoose.model('tag', TagSchema);

export default TagModel;