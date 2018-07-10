const assert = require('assert');
const makeDebug = require('debug');
const fp = require('mostly-func');
const { plural } = require('pluralize');

const defaultHooks = require('./document-tag.hooks');

const debug = makeDebug('playing:content-services:documents/tags');

const defaultOptions = {
  name: 'documents/tags'
};

class DocumentTagService {
  constructor (options) {
    this.options = fp.assignAll(defaultOptions, options);
    this.name = this.options.name;
  }

  setup (app) {
    this.app = app;
    this.hooks(defaultHooks(this.options));
  }

  async create (data, params) {
    const doc = params.primary;
    assert(doc && doc.id, 'document is not exists');
    assert(data.tags, 'tags is not provided.');

    const svcTags = this.app.service('tags');
    const svcDocuments = this.app.service(plural(doc.type));

    return Promise.all([
      svcDocuments.patch(doc.id, {
        $addToSet: { tags: { $each: data.tags } }
      }, params),
      data.tags.map((tag) => svcTags.action('upsert').create({
        id: tag.toLowerCase(),
        label: tag
      }))
    ]).then(([docs, tags]) => tags);
  }

  async remove (id, params) {
    const doc = params.primary;
    assert(doc && doc.id, 'document is not exists');
    assert(id || params.query.tags, 'tags not provided.');
    const tags = fp.splitOrArray(id || params.query.tags);

    const svcDocuments = this.app.service(plural(doc.type));
    return svcDocuments.patch(doc.id, {
      $pull: { tags: { $in: tags } }
    }, params);
  }
}

module.exports = function init (app, options, hooks) {
  return new DocumentTagService(options);
};
module.exports.Service = DocumentTagService;
