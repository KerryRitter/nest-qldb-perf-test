import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { NestQldbModule, QldbDriver } from 'nest-qldb';
import { SharedIniFileCredentials } from 'aws-sdk';

@Module({
  imports: [
    NestQldbModule.forRoot({
      qldbDriver: new QldbDriver('test-qldb-ledger', {
        region: 'us-east-1',
        credentials: new SharedIniFileCredentials({
          profile: 'personal',
        }),
      }, 10, 60000),
      // createTablesAndIndexes: true,
    }),
  ],
  providers: [AppService],
})
export class AppModule {}
