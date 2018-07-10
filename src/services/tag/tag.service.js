const { Service, createService } = require('mostly-feathers-mongoose');
const fp = require('mostly-func');

const TagModel = require('../../models/tag.model');
const defaultHooks = require('./tag.hooks');

const defaultOptions = {
  id: 'id',
  name: 'tags'
};

class TagService extends Service {
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
  options = { ModelName: 'tag', ...options };
  return createService(app, TagService, TagModel, options);
};
module.exports.Service = TagService;
