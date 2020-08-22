import { Injectable } from '@nestjs/common';
import { InjectRepository, QldbQueryService, Repository } from 'nest-qldb';
import { Artist } from './nested-docs-models';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(Artist) readonly artistRepo: Repository<Artist>,
    readonly qs: QldbQueryService,
  ) {}
}
