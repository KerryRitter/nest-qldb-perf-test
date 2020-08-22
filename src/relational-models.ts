import { QldbTable } from 'nest-qldb';

@QldbTable({
  tableName: 'artists',
  tableIndexes: ['name', 'searchable'],
})
export class Artist {
  id?: string;

  name: string;
  searchable: boolean = false;

  constructor(partial: Partial<Artist>) {
    Object.assign(this, partial);
  }
}

@QldbTable({
  tableName: 'releases',
  tableIndexes: ['name', 'searchable', 'artistId'],
})
export class Release {
  id?: string;

  artistId: string;

  name: string;
  searchable: boolean = false;

  constructor(partial: Partial<Release>) {
    Object.assign(this, partial);
  }
}

@QldbTable({
  tableName: 'tracks',
  tableIndexes: ['name', 'searchable', 'artistId', 'releaseId'],
})
export class Track {
  id?: string;

  artistId: string;
  releaseId: string;

  name: string;
  searchable: boolean = false;

  constructor(partial: Partial<Track>) {
    Object.assign(this, partial);
  }
}
