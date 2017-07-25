import { Service, createService } from 'mostly-feathers-mongoose';
import TagModel from '~/models/tag-model';
import defaultHooks from './tag-hooks';

const defaultOptions = {
  id: 'id',
  name: 'tags'
};

class TagService extends Service {
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
  options = Object.assign({ ModelName: 'tag' }, options);
  return createService(app, TagService, TagModel, options);
}

init.Service = TagService;
