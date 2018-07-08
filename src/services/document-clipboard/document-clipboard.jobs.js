import assert from 'assert';
import makeDebug from 'debug';
import fp from 'mostly-func';
import { copyDocument, moveDocument } from 'playing-content-common';

const debug = makeDebug('playing:content-services:documents/clipboards:jobs');

export default function (app, options) {
  const agenda = app.agenda;
  const lockLifetime = options.agenda && options.agenda.lockLifetime || 300 * 1000;
  assert(agenda, 'agenda not configured properly, check your app');

  // fanout the operations to copy/move documents
  agenda.define('fanout_documents', { lockLifetime }, function (job, next) {
    debug('>>> fanout_documents', job.attrs.data);
    const { operation, documents } = job.attrs.data;
    if (operation && documents && documents.length > 0) {
      const operations = fp.map(doc => {
        switch (operation) {
          case 'copyDocuments': return copyDocument(app, doc);
          case 'moveDocuments': return moveDocument(app, doc);
          default: Promise.resolve();
        }
      }, documents);
      Promise.all(operations).then(next);
    } else {
      console.error('fanout_documents job is not provided:', job.attrs.data);
      next();
    }
  });
}