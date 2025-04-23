import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    // model
    return 'Hello World!';
  }
}
