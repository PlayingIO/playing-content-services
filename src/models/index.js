import { upperFirst, camelCase } from 'lodash';
import glob from 'glob';
import path from 'path';
import mongoose from 'mongoose';
import Entity from 'mostly-entity';

let models = {};
let entities = {};

let modelFiles = glob.sync(path.join(__dirname, './*/model.js'));
let entitieFiles = glob.sync(path.join(__dirname, './*/entity.js'));

// Load all models
modelFiles.forEach(file => {
  let model = path.basename(path.dirname(file));
  let name = upperFirst(camelCase(model));
  models[name] = require(file);
});

// Load all entities
entitieFiles.forEach(file => {
  let entity = path.basename(path.dirname(file));
  let name = upperFirst(camelCase(entity));
  entities[name] = require(file);
});

export { models as default, entities };