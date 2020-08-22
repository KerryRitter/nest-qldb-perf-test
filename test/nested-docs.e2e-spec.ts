import { AppModule } from '../src/app.module';
import { AppService } from '../src/app.service';
import { NestFactory } from '@nestjs/core';
import { v4 as uuidv4 } from 'uuid';
import { Artist, Release, Track } from '../src/nested-docs-models';
import { differenceInMilliseconds } from 'date-fns';
import { QldbQueryService } from 'nest-qldb';

describe('Nested Design', () => {
  let queryService: QldbQueryService;

  beforeEach(async () => {
    jest.setTimeout(10000000);
    const app = await NestFactory.createApplicationContext(AppModule);
    queryService = app.get(AppService).qs;
  });

  test('query records', async () => {
    const start = new Date();

    const result = await queryService.query<any>(`
      SELECT *
      FROM artists AS a, 
          a.releases AS r,
          a.tracks AS t
      WHERE a.name LIKE '%e96%' OR r.name LIKE '%e96%' OR t.name LIKE '%e96%'
    `);

    const end = new Date();

    console.log({
      resultCount: result?.length,
      time: differenceInMilliseconds(end, start),
    });
  });

  test.skip('generate records', async () => {
    const start = new Date();

    let totalCount = 0;
    for (let i = 0; i < 10; i++) {
      const tracks: Track[] = [];
      const releases: Release[] = [];

      for (let k = 0; k < 5; k++) {
        tracks.push(new Track({
          id: uuidv4(),
          name: `Track ${uuidv4()}`,
          searchable: true,
        }));
      }

      for (let j = 0; j < 10; j++) {
        console.log('** Creating release...');
        releases.push(new Release({
          name: `Release ${uuidv4()}`,
          searchable: true,
          trackIds: tracks.map(t => t.id),
        }));
      }

      console.log('Creating artist...');
      const artist = await queryService.querySingle<Artist>(`INSERT INTO artists ?`, [new Artist({
        name: `Artist ${uuidv4()}`,
        searchable: true,
        releases,
        tracks,
      })]);
      totalCount++;
    }
    const end = new Date();

    console.log({
      totalCount,
      time: differenceInMilliseconds(end, start),
    });

    // Last run: 10 records (with nested docs) in 7863ms
  });
});
