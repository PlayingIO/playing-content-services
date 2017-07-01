import nats from 'nats';
import mostly from 'mostly-node';
import feathers from 'mostly-feathers';
import { stats } from 'mostly-plugins-common';
import hooks from 'feathers-hooks';
import services from './services';
import { config } from 'common';
import Promise from 'bluebird';

global.Promise = Promise;

const trans = new mostly(nats.connect(config.nats), {
  name: 'book-services',
  logLevel: 'info',
  load: {
    sampleInterval: 100
  }
});

trans.use(stats);
trans.ready(() => {
  var app = feathers(trans)
    .configure(hooks())
    .configure(services)
    .start();
});

trans.onError(e => {
  console.error('Error [' + config.nats + ']: ' + e);
  process.exit();
});