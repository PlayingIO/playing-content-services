import mongoose from 'mongoose';
import timestamps from 'mongoose-timestamp';
import { plugins } from 'mostly-feathers-mongoose';

const ResourceSchema = new mongoose.Schema({
  name: { type: 'String', required: true  }
});

ResourceSchema.plugin(timestamps);
ResourceSchema.plugin(plugins.softDelete);

const ResourceModel = mongoose.model('resource', ResourceSchema);

export default ResourceModel;