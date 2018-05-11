import { Service, createService } from 'mostly-feathers-mongoose';
import fp from 'mostly-func';

import AuthorModel from '../../models/author.model';
import defaultHooks from './author.hooks';

const defaultOptions = {
  id: 'id',
  name: 'tags'
};

export class AuthorService extends Service {
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
  options = { ModelName: 'author', ...options };
  return createService(app, AuthorService, AuthorModel, options);
}

init.Service = AuthorService;
