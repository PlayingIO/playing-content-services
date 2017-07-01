import { Service as BaseService } from 'mostly-feathers-mongoose';
import { config } from 'common';
import models from '~/models';

export default class ChapterService extends BaseService {
  constructor() {
    super({
      name: 'ChapterService',
      Model: models.Chapter,
      lean: true,
      paginate: config.paginate
    });
  }
}
