import { Service as BaseService } from 'mostly-feathers-mongoose';
import { config } from 'common';
import models from '~/models';

export default class BookService extends BaseService {
  constructor() {
    super({
      name: 'BookService',
      Model: models.Book,
      lean: true,
      paginate: config.paginate
    });
  }
}
