import { Body, Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { LocalAuthGuard } from './local-auth.guard';
import { AuthService } from './auth.service';
import { Public, ResponseMessage, User } from 'src/decorator/customize';
import { RegisterUserDto, UserLoginDto } from 'src/users/dto/create-user.dto';
import { Request, Response } from 'express';
import { IUser } from 'src/users/users.interface';
import { RolesService } from 'src/roles/roles.service';
import { ThrottlerGuard } from '@nestjs/throttler';
import { ApiBody } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
  constructor( 
    private authService: AuthService,
    private roleService: RolesService,
  ) {}

  @Public()
  @UseGuards(LocalAuthGuard)
  @UseGuards(ThrottlerGuard)
  @ApiBody({ type: UserLoginDto, })
  @ResponseMessage("User login")
  @Post("/login")
  handleLogin(
    @Req() req,
    @Res({ passthrough: true }) response: Response
  ) {
    return this.authService.login(req.user, response);
  }

  @Public()
  @ResponseMessage("Register a new user")
  @Post("/register")
  handleRegister(@Body() registerUserDto: RegisterUserDto) {
    return this.authService.register(registerUserDto);
  }

  @ResponseMessage("Get user information")
  @Get("/account")
  async handleGetAccount(@User() user: IUser) {
    const temp = await this.roleService.findOne(user.role._id) as any;
    user.permissions = temp.permissions
    return {user}
  }

  @Public()
  @ResponseMessage("Get User by refresh token")
  @Get("/refresh")
  handleRefreshToken(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response
  ) {
    const refreshTokne = request.cookies["refresh_token"]
    return this.authService.processNewToken(refreshTokne, response)
  }

  @ResponseMessage("Logout User")
  @Post("/logout")
  handleLogout(
    @User() user: IUser,
    @Res({ passthrough: true }) response: Response
  ) {
    return this.authService.logout(user, response)
  }
}