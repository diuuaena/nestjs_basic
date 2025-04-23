import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [MongooseModule.forRoot('mongodb+srv://rs-phongnq1:Phong859@@nestjs-basic.cka9gg4.mongodb.net/')],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
