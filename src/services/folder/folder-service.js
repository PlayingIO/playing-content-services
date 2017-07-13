import { Service, createService } from 'mostly-feathers-mongoose';
import FolderModel from '~/models/folder-model';
import defaultHooks from './folder-hooks';

const defaultOptions = {
  name: 'folder-service'
};

class FolderService extends Service {
  constructor(options) {
    options = Object.assign({}, defaultOptions, options);
    super(options);
  }

  setup(app) {
    super.setup(app);
    this.hooks(defaultHooks(this.options));
  }
}

export default function init(app, options, hooks) {
  options = Object.assign({ ModelName: 'folder' }, options);
  return createService(app, FolderService, FolderModel, options);
}

init.Service = FolderService;
