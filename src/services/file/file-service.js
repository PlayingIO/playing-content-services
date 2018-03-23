import { Service, createService } from 'mostly-feathers-mongoose';
import FileModel from '~/models/file-model';
import defaultHooks from './file-hooks';

const defaultOptions = {
  name: 'files'
};

class FileService extends Service {
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
  options = Object.assign({ ModelName: 'file' }, options);
  return createService(app, FileService, FileModel, options);
}

init.Service = FileService;
