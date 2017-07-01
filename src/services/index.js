import glob from 'glob';
import path from 'path';
import mongoose from 'mongoose';
import { authentication } from 'mostly-admin-services';
import { config } from 'common';

export default function() {
  const app = this;

  mongoose.connect(config.mongodb.db)
  .catch(err => {
    console.log('connect to %s error: ', config.mongodb.db, err.message);
    process.exit(1);
  });

  mongoose.Promise = global.Promise;
  mongoose.set('debug', true);
  
  app.configure(authentication(config.auth));

  // load all services
  let servieFiles = glob.sync(path.join(__dirname, './*/index.js'));
  servieFiles.forEach(file => {
    var service = require(file);
    app.configure(service);
  });
}