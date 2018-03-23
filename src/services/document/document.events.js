import makeDebug from 'debug';

const debug = makeDebug('playing:content-services:documents:events');

const createActivity = async function (app, document, verb, message) {
  const svcFeeds = app.service('feeds');
  const svcActivities = app.service('activities');
  if (!document.creator) return; // skip feeds without actor

  const feed = await svcFeeds.get(`${document.type}:${document.id}`);
  if (feed) {
    await svcActivities.create({
      feed: feed.id,
      actor: `user:${document.creator}`,
      verb: verb,
      object: `${document.type}:${document.id}`,
      foreignId: `${document.type}:${document.id}`,
      message: message,
      title: document.title,
      cc: [`user:${document.creator}`]
    });
  }
};

// subscribe to document.create events
export default function (app, options) {
  app.trans.add({
    pubsub$: true,
    topic: 'playing.events',
    cmd: 'document.create'
  }, (resp) => {
    const document = resp.event;
    if (document && document.type) {
      debug('document.create event', document.type, document.id);
      createActivity(app, document, 'documentCreated', 'created the document');
    }
  });
}
