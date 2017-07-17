import { Service, createService } from 'mostly-feathers-mongoose';
import SubjectModel from '~/models/subject-model';
import defaultHooks from './subject-hooks';

const defaultOptions = {
  name: 'subjects'
};

class SubjectService extends Service {
  constructor(options) {
    options = Object.assign({}, defaultOptions, options);
    super(options);
  }

  setup(app) {
    super.setup(app);
    this.hooks(defaultHooks(this.options));
  }
}

export default function init(app, options, hooks) {
  options = Object.assign({ ModelName: 'subject' }, options);
  return createService(app, SubjectService, SubjectModel, options);
}

init.Service = SubjectService;
