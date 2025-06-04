import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';

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

  login(user: any) {
    const payload = { 
      username: user.email,
      _id: user._id,
      name: user.name,
      address: user.address,
    };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}