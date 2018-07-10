const { Service, createService } = require('mostly-feathers-mongoose');
const fp = require('mostly-func');

const FileModel = require('../../models/file.model');
const defaultHooks = require('./file.hooks');

const defaultOptions = {
  name: 'files'
};

class FileService extends Service {
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
  options = { ModelName: 'file', ...options };
  return createService(app, FileService, FileModel, options);
};
module.exports.Service = FileService;
