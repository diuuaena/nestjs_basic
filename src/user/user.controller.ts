import { Controller, Delete, Get } from '@nestjs/common';

@Controller("user")
export class UserController {

  @Get()
  findAll(): string {
    return 'all user'
  }

  @Get("/user-id")
  findById(): string {
    return 'get user with userid'
  }
}
