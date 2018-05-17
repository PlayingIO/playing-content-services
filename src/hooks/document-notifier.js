import assert from 'assert';
import fp from 'mostly-func';
import { helpers } from 'mostly-feathers-mongoose';
import { hooks as feeds } from 'playing-feed-services';

import { createDocumentActivity } from '../helpers';

const createDocument = (context) => {
  const document = helpers.getHookData(context);
  const actor = context.params.user.id;
  const custom = {
    actor: `user:${document.creator}`,
    verb: 'document.create',
    message: 'Create the document',
    title: document.title
  };
  return [
    createDocumentActivity(context, document, custom),
    `user:${actor}`,                     // add to actor's activity log
    `${document.type}:${document.id}`,   // add to document's activity log
    `notification:${document.creator}`   // add to document author's notification stream
  ];
};

const notifiers = {
  'document.create': createDocument
};

export default function documentNotify (event) {
  return feeds.notify(event, notifiers);
}

