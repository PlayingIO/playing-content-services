import makeDebug from 'debug';

const debug = makeDebug('playing:interaction-services:activities:subscriptions:document-events');

// subscribe to document.create events
export function subDocumentEvents(app, options) {
  const feeds = app.service('feeds');
  const activities = app.service('activities');
  app.trans.add({
    pubsub$: true,
    topic: 'playing.events',
    cmd: 'document.create'
  }, (resp) => {
    const document = resp.event;
    const creator = document && document.creator;
    debug('document.create', document);
    if (document && creator) {
      feeds.get(`document:${document.id}`).then((feed) => {
        if (feed) {
          activities.create({
            feed: feed.id,
            actor: `user:${creator.id}`,
            verb: 'documentCreated',
            object: `document:${document.id}`,
            foreignId: `document:document.id`,
            message: 'created the document',
            title: document.title,
            cc: [`user:${creator.id}`]
          });
        }
      });
    }
  });
}
