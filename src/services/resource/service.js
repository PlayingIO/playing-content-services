import { Service as BaseService } from 'mostly-feathers-mongoose';
import { config } from 'common';
import models from '~/models';

export default class ResourceService extends BaseService {
  constructor() {
    super({
      name: 'ResourceService',
      Model: models.Resource,
      lean: true,
      paginate: config.paginate
    });
  }
}
