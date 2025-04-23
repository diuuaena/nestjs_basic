import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  //imports: [MongooseModule.forRoot('mongodb+srv://rs-phongnq1:Phong859@@nestjs-basic.cka9gg4.mongodb.net/')],
  imports: [
    //MongooseModule.forRoot('mongodb+srv://rs-phongnq1:Phong859@nestjs-basic.kffuogu.mongodb.net/'),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URL'),
      }),
      inject: [ConfigService],
    }),
    ConfigModule.forRoot({
      //envFilePath: './.test.env',
      isGlobal: true,
    }),
    UsersModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
