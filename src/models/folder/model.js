import mongoose from 'mongoose';
import timestamps from 'mongoose-timestamp';
import { plugins } from 'mostly-feathers-mongoose';
import DocumentModel from '../document/model';

const FolderSchema = new mongoose.Schema({
  parent: { type: 'ObjectId', ref: 'folder' },
  path: { type: 'String', default: '/', unique: true },
  color: { type: 'String' }
});

const FolderModel = DocumentModel.discriminator('folder', FolderSchema);

export default FolderModel;