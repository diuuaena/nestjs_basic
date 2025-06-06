import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { IUser } from 'src/users/users.interface';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) {}
  // username, password là 2 tham số trả về của thư viện passport
  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.getUserByEmail(username);

    if (user) {
        const isValid = this.usersService.isCheckPassword(pass, user.password)
        if (isValid === true) {
            return user;
        }
    }
    return null;
  }

  login(user: IUser) {
    const {_id, name, email, role} = user;
    const payload = {
      sub: "token login",
      iss: "from server",
      _id,
      name,
      email,
      role
    };
    return {
      access_token: this.jwtService.sign(payload),
      _id,
      name,
      email,
      role
    };
  }
}