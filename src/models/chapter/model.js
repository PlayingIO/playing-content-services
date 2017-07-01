import mongoose from 'mongoose';
import timestamps from 'mongoose-timestamp';
import { plugins } from 'mostly-feathers-mongoose';
import DocumentModel from '../document/model';

const ChapterSchema = new mongoose.Schema({
  parent: { type: 'ObjectId', ref: 'books' },
  content: { type: 'String'  },
  mimeType: { type: 'String' }
});

const ChapterModel = DocumentModel.discriminator('chapter', ChapterSchema);

export default ChapterModel;