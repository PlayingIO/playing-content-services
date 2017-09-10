import makeDebug from 'debug';

const debug = makeDebug('playing:content-services:documents:events');

const createActivity = function(app, document, verb, message) {
  const feeds = app.service('feeds');
  const activities = app.service('activities');
  if (!document.creator) return; // skip feeds without actor

  return feeds.get(`document:${document.id}`).then((feed) => {
    if (feed) {
      activities.create({
        feed: feed.id,
        actor: `user:${document.creator}`,
        verb: verb,
        object: `document:${document.id}`,
        foreignId: `document:${document.id}`,
        message: message,
        title: document.title,
        cc: [`user:${document.creator}`]
      });
    }
  });
};

// subscribe to document.create events
export function subDocumentEvents(app, options) {
  app.trans.add({
    pubsub$: true,
    topic: 'playing.events',
    cmd: 'document.create'
  }, (resp) => {
    const document = resp.event;
    debug('document.create', document);
    if (document) {
      createActivity(app, document, 'documentCreated', 'created the document');
    }
  });
}
