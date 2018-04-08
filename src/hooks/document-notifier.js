import { helpers } from 'mostly-feathers-mongoose';
import { helpers as feeds } from 'playing-feed-services';

export default function (event) {
  return context => {
    const svcDocuments = context.app.service('documents');

    const createActivity = async function (document, verb, message) {
      if (!document.creator) return; // skip feeds without actor

      const activity = {
        actor: `user:${document.creator}`,
        verb: verb,
        object: `${document.type}:${document.id}`,
        foreignId: `${document.type}:${document.id}`,
        message: message,
        title: document.title
      };

      await feeds.addActivity(context.app, activity).feeds(
        `${document.type}:${document.id}`,     // add to document's activity log
        `user:${document.creator}`,          // add to creator's activity log
        `notification:${document.creator}`   // add to document author's notification stream
      );
    };

    const result = helpers.getHookData(context);
    switch (event) {
      case 'document.create':
        createActivity(result, event, 'Created the document');
        break;
    }
  };
}
