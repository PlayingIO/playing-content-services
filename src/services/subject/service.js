import { Service as BaseService } from 'mostly-feathers-mongoose';
import { config } from 'common';
import models from '~/models';

export default class SubjectService extends BaseService {
  constructor() {
    super({
      name: 'SubjectService',
      Model: models.Subject,
      lean: true,
      paginate: config.paginate
    });
  }
}
