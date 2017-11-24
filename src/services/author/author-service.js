import { Service, createService } from 'mostly-feathers-mongoose';
import AuthorModel from '~/models/author-model';
import defaultHooks from './author-hooks';

const defaultOptions = {
  id: 'id',
  name: 'tags'
};

class AuthorService extends Service {
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
  options = Object.assign({ ModelName: 'author' }, options);
  return createService(app, AuthorService, AuthorModel, options);
}

init.Service = AuthorService;
