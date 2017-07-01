import { Service as BaseService } from 'mostly-feathers-mongoose';
import { config } from 'common';
import models from '~/models';

export default class FolderService extends BaseService {
  constructor() {
    super({
      name: 'FolderService',
      Model: models.Folder,
      lean: true,
      paginate: config.paginate
    });
  }
}
