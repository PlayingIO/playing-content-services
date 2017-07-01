import { Service as BaseService } from 'mostly-feathers-mongoose';
import { config } from 'common';
import models from '~/models';

export default class DocumentService extends BaseService {
  constructor() {
    super({
      name: 'DocumentService',
      Model: models.Document,
      lean: true,
      paginate: config.paginate
    });
  }
}
