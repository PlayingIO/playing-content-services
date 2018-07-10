const { Service, createService } = require('mostly-feathers-mongoose');
const fp = require('mostly-func');

const AuthorModel = require('../../models/author.model');
const defaultHooks = require('./author.hooks');

const defaultOptions = {
  id: 'id',
  name: 'tags'
};

class AuthorService extends Service {
  constructor (options) {
    options = fp.assignAll(defaultOptions, options);
    super(options);
  }

  setup (app) {
    super.setup(app);
    this.hooks(defaultHooks(this.options));
  }
}

module.exports = function init (app, options, hooks) {
  options = { ModelName: 'author', ...options };
  return createService(app, AuthorService, AuthorModel, options);
};
module.exports.Service = AuthorService;
