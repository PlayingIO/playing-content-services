import { Service, createService } from 'mostly-feathers-mongoose';
import fp from 'mostly-func';

import FileModel from '../../models/file.model';
import defaultHooks from './file.hooks';

const defaultOptions = {
  name: 'files'
};

export class FileService extends Service {
  constructor (options) {
    options = fp.assign(defaultOptions, options);
    super(options);
  }

  setup (app) {
    super.setup(app);
    this.hooks(defaultHooks(this.options));
  }
}

export default function init (app, options, hooks) {
  options = { ModelName: 'file', ...options };
  return createService(app, FileService, FileModel, options);
}

init.Service = FileService;
