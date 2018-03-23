import { Service, createService } from 'mostly-feathers-mongoose';
import NoteModel from '~/models/note-model';
import defaultHooks from './note-hooks';

const defaultOptions = {
  name: 'notes'
};

class NoteService extends Service {
  constructor (options) {
    options = Object.assign({}, defaultOptions, options);
    super(options);
  }

  setup (app) {
    super.setup(app);
    this.hooks(defaultHooks(this.options));
  }
}

export default function init (app, options, hooks) {
  options = Object.assign({ ModelName: 'note' }, options);
  return createService(app, NoteService, NoteModel, options);
}

init.Service = NoteService;
