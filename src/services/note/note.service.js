const { Service, createService } = require('mostly-feathers-mongoose');
const fp = require('mostly-func');

const NoteModel = require('../../models/note.model');
const defaultHooks = require('./note.hooks');

const defaultOptions = {
  name: 'notes'
};

class NoteService extends Service {
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
  options = { ModelName: 'note', ...options };
  return createService(app, NoteService, NoteModel, options);
};
module.exports.Service = NoteService;
