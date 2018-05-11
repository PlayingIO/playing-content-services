import { Service, createService } from 'mostly-feathers-mongoose';
import fp from 'mostly-func';

import TagModel from '../../models/tag.model';
import defaultHooks from './tag.hooks';

const defaultOptions = {
  id: 'id',
  name: 'tags'
};

export class TagService extends Service {
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
  options = { ModelName: 'tag', ...options };
  return createService(app, TagService, TagModel, options);
}

init.Service = TagService;
