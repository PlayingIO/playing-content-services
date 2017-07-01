import { Service as BaseService } from 'mostly-feathers-mongoose';
import { config } from 'common';
import models from '~/models';

export default class TagService extends BaseService {
  constructor() {
    super({
      name: 'TagService',
      Model: models.Tag,
      lean: true,
      paginate: config.paginate
    });
  }
}
