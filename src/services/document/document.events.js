import makeDebug from 'debug';

const debug = makeDebug('playing:content-services:documents:events');

const createActivity = async function (app, document, verb, message) {
  if (!document.creator) return; // skip feeds without actor

  const svcFeeds = app.service('feeds');

  const activity = {
    actor: `user:${document.creator}`,
    verb: verb,
    object: `${document.type}:${document.id}`,
    foreignId: `${document.type}:${document.id}`,
    message: message,
    title: document.title,
    cc: [`user:${document.creator}`]
  };

  // add to document's activity log
  await svcFeeds.action('addActivity').patch(`${document.type}:${document.id}`, activity);
};

// subscribe to document.create events
export default function (app, options) {
  app.trans.add({
    topic: 'playing.events',
    cmd: 'document.create'
  }, (resp) => {
    const document = resp.event;
    if (document && document.type) {
      debug('document.create event', document.type, document.id);
      createActivity(app, document, 'document.create', 'created the document');
    }
  });
}
