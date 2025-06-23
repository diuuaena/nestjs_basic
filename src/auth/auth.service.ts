import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { IUser } from 'src/users/users.interface';
import { RegisterUserDto } from 'src/users/dto/create-user.dto';
import { ConfigService } from '@nestjs/config';
import ms from 'ms';
import { Response } from 'express';
import { RolesService } from 'src/roles/roles.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private roleService: RolesService,
  ) { }
  // username, password là 2 tham số trả về của thư viện passport
  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.getUserByEmail(username);

    if (user) {
      const isValid = this.usersService.isCheckPassword(pass, user.password)
      if (isValid === true) {
        const userRole = user.role as unknown as { _id: string, name: string };
        const temp = await this.roleService.findOne(userRole?._id);

        const objUser = {
          ...user.toObject(),
          permissions: temp?.permissions ?? []
        }
        return objUser;
      }
    }
    return null;
  }

  async login(user: IUser, response: Response) {
    const { _id, name, email, role, permissions } = user;
    const payload = {
      sub: "token login",
      iss: "from server",
      _id,
      name,
      email,
      role,
    };
    const refresh_token = await this.createRefreshToken(payload);
    await this.usersService.updateUserToken(refresh_token, _id)
    // set refresh token as cookies
    response.cookie("refresh_token", refresh_token, {
      httpOnly: true,
      maxAge: parseFloat(ms(this.configService.get('JWT_REFRESH_EXPIRE')))
    })
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        _id,
        name,
        email,
        role,
        permissions
      }
    };
  }

  async register(registerUserDto: RegisterUserDto) {
    let newUser = await this.usersService.register(registerUserDto);
    return {
      _id: newUser?._id,
      createdAt: newUser?.createdAt
    };
  }

  createRefreshToken = (payload) => {
    const refresh_token = this.jwtService.sign(payload, {
      secret: this.configService.get<string>("JWT_REFRESH_TOKEN_SECRET"),
      expiresIn: parseInt(ms(this.configService.get('JWT_REFRESH_EXPIRE'))) / 1000
    });
    return refresh_token;
  }

  async processNewToken(refreshToken: string, response: Response) {
    try {
      this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>("JWT_REFRESH_TOKEN_SECRET")
      })

      const user = await this.usersService.findUserByRefreshToken(refreshToken)

      if (!user)
        new BadRequestException("Refresh token không hợp lệ")

      const { _id, name, email, role } = user;
      const payload = {
        sub: "token refresh",
        iss: "from server",
        _id,
        name,
        email,
        role
      };
      const refresh_token = await this.createRefreshToken(payload);
      await this.usersService.updateUserToken(refresh_token, _id.toString())
      const userRole = user.role as unknown as { _id: string, name: string };
      const temp = await this.roleService.findOne(userRole?._id);
      response.clearCookie("refresh_token");
      // set refresh token as cookies
      response.cookie("refresh_token", refresh_token, {
        httpOnly: true,
        maxAge: parseFloat(ms(this.configService.get('JWT_REFRESH_EXPIRE')))
      })
      return {
        access_token: this.jwtService.sign(payload),
        user: {
          _id,
          name,
          email,
          role,
          permissions: temp?.permissions ?? []
        }
      };
    } catch (error) {
      throw new BadRequestException("Refresh token không hợp lệ")
    }
  }

  async logout(user: IUser, response: Response) {
    await this.usersService.updateUserToken("", user._id);
    response.clearCookie["refresh_token"];
    return "oke";
  }
}