import { QldbTable } from 'nest-qldb';

@QldbTable({
  tableName: 'artists',
  tableIndexes: ['name', 'searchable'],
})
export class Artist {
  id?: string;

  name: string;
  searchable: boolean = false;

  releases: Release[] = [];
  tracks: Track[] = [];

  constructor(partial: Partial<Artist>) {
    Object.assign(this, partial);
  }
}

export class Release {
  id?: string;

  name: string;
  searchable: boolean = false;
  trackIds: string[];

  constructor(partial: Partial<Release>) {
    Object.assign(this, partial);
  }
}

export class Track {
  id?: string;

  name: string;
  searchable: boolean = false;

  constructor(partial: Partial<Track>) {
    Object.assign(this, partial);
  }
}
