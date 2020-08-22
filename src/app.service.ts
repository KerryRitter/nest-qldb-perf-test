import { Injectable } from '@nestjs/common';
import { InjectRepository, QldbQueryService, Repository } from 'nest-qldb';
import { Artist, Release, Track } from './models';

@Injectable()
export class AppService {
  constructor(
    @InjectRepository(Artist) readonly artistRepo: Repository<Artist>,
    @InjectRepository(Release) readonly releaseRepo: Repository<Release>,
    @InjectRepository(Track) readonly trackRepo: Repository<Track>,
    readonly qs: QldbQueryService,
  ) {}
}
