import { INestApplicationContext } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { AppService } from '../src/app.service';
import { NestFactory } from '@nestjs/core';
import { v4 as uuidv4 } from 'uuid';
import { Artist, Release, Track } from '../src/relational-models';
import { differenceInMilliseconds } from 'date-fns';
import { QldbQueryService } from 'nest-qldb';

describe.skip('Relational Design', () => {
  let queryService: QldbQueryService;

  beforeEach(async () => {
    jest.setTimeout(10000000);
    const app = await NestFactory.createApplicationContext(AppModule);
    queryService = app.get(AppService).qs;
  });

  test('get record count', async () => {
    const start = new Date();

    const result = await queryService.querySingle<{ totalCount: number }>(`
    SELECT count(*) as totalCount
    FROM artists as a BY xartistId
    INNER JOIN releases as r BY xreleaseId ON r.artistId = xartistId
    INNER JOIN tracks as t ON t.releaseId = xreleaseId 
    `);

    const end = new Date();
    console.log({
      resultCount: result,
      time: differenceInMilliseconds(end, start),
    });
  });

  test('query records', async () => {
    const start = new Date();

    const result = await queryService.query<any>(`
      SELECT a.*, r.*, t.*
      FROM artists as a BY xartistId
      INNER JOIN releases as r BY xreleaseId ON r.artistId = xartistId
      INNER JOIN tracks as t ON t.releaseId = xreleaseId
      WHERE a.name LIKE '%488%' OR r.name LIKE '%488%' OR t.name LIKE '%488%'
    `);

    const end = new Date();

    console.log({
      resultCount: result?.length,
      time: differenceInMilliseconds(end, start),
    });
  });

  test('generate records', async () => {
    const start = new Date();

    let totalCount = 0;
    for (let i = 0; i < 10; i++) {
      console.log('Creating artist...');
      const artist = await queryService.querySingle<Artist>(`INSERT INTO artists ?`, [new Artist({
        name: `Artist ${uuidv4()}`,
        searchable: true,
      })]);
      totalCount++;

      for (let j = 0; j < 10; j++) {
        console.log('** Creating release...');
        const release = await queryService.querySingle<Release>(`INSERT INTO releases ?`, [new Release({
          name: `Release ${uuidv4()}`,
          searchable: true,
          artistId: artist.id,
        })]);
        totalCount++;
        
        for (let k = 0; k < 5; k++) {
          console.log('**** Creating track...');
          const track = await queryService.querySingle<Track>(`INSERT INTO tracks ?`, [new Track({
            name: `Track ${uuidv4()}`,
            searchable: true,
            artistId: artist.id,
            releaseId: release.id,
          })]);
          totalCount++;
        }
      }
    }
    const end = new Date();

    console.log({
      totalCount,
      time: differenceInMilliseconds(end, start),
    });

    // Last run: 610 records in 441448ms
  });
});
