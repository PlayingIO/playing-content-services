import mongoose from 'mongoose';
import timestamps from 'mongoose-timestamp';
import { plugins } from 'mostly-feathers-mongoose';

const SubjectSchema = new mongoose.Schema({
  name: { type: 'String', required: true  },
  label: { type: 'String', required: true  },
  parent: { type: 'ObjectId' }
});

SubjectSchema.plugin(timestamps);
SubjectSchema.plugin(plugins.softDelete);
SubjectSchema.plugin(plugins.sortable, { classify: 'parent' });

const SubjectModel = mongoose.model('subject', SubjectSchema);

export default SubjectModel;