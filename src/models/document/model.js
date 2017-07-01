import mongoose from 'mongoose';
import timestamps from 'mongoose-timestamp';
import { plugins } from 'mostly-feathers-mongoose';

const options = { discriminatorKey: 'type' };

const DocumentSchema = new mongoose.Schema({
  title: { type: 'String', required: true },
  description: { type: 'String' },
  subjects: [{ type: 'String' }],
  rights: [{ type: 'String' }],
  source: { type: 'String' },
  nature: { type: 'String' },
  coverage: { type: 'String' },
  issued: { type: 'Date' },
  valid: { type: 'Date' },
  expired: { type: 'Date' },
  format: { type: 'String' },
  language: { type: 'String' },
  creator: { type: 'String' },
  contributors: [{ type: 'String' }],
  verion: { type: 'String' }
}, options);

DocumentSchema.plugin(timestamps);
DocumentSchema.plugin(plugins.softDelete);

const DocumentModel = mongoose.model('document', DocumentSchema);

export default DocumentModel;