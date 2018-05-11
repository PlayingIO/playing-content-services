import { Service, createService } from 'mostly-feathers-mongoose';
import fp from 'mostly-func';

import NoteModel from '../../models/note.model';
import defaultHooks from './note.hooks';

const defaultOptions = {
  name: 'notes'
};

export class NoteService extends Service {
  constructor (options) {
    options = fp.assignAll(defaultOptions, options);
    super(options);
  }

  setup (app) {
    super.setup(app);
    this.hooks(defaultHooks(this.options));
  }
}

export default function init (app, options, hooks) {
  options = { ModelName: 'note', ...options };
  return createService(app, NoteService, NoteModel, options);
}

init.Service = NoteService;
