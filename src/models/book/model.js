import mongoose from 'mongoose';
import timestamps from 'mongoose-timestamp';
import { plugins } from 'mostly-feathers-mongoose';
import DocumentModel from '../document/model';

const BookSchema = new mongoose.Schema({
  parent: { type: 'ObjectId', ref: 'folders' },
  authors: [{ type: 'String' }],
  translators: [{ type: 'String' }],
  publisher: { type: 'String' },
  isbn: { type: 'String' },
  douban: { type: 'String' },
  rating: {
    max: { type: 'Number', default: 0 },
    min: { type: 'Number', default: 0 },
    average: { type: 'Number', default: 0 },
    total: { type: 'Number', default: 0 }
  },
  price: { type: 'Number', default: 0 }
});

const BookModel = DocumentModel.discriminator('book', BookSchema);

export default BookModel;