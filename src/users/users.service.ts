import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto, RegisterUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import mongoose, { Model } from 'mongoose';
import { compareSync, genSaltSync, hashSync } from "bcryptjs";
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { IUser } from './users.interface';

@Injectable()
export class UsersService {
  constructor( @InjectModel(User.name) private readonly userModel: SoftDeleteModel<UserDocument>) { }

  getHashPassword = (password: string) => {
    const salt = genSaltSync(10);
    const hash = hashSync(password, salt);
    return hash
  }

  async create(createUserDto: CreateUserDto, user: IUser) {
    let { email, password, name, age, gender, address, role, company } = createUserDto;
    let checkEmailExist = await this.userModel.findOne({ email: email });
    if (checkEmailExist) {
      throw new BadRequestException(`Email ${email} đã tồn tại. Vui lòng chọn email khác`)
    }
    const hashPassword = this.getHashPassword(password);
    let newUser = await this.userModel.create({ 
      email,
      password: hashPassword,
      name,
      age,
      gender,
      address,
      role,
      company,
      createdBy: {
        _id: user._id,
        email: user.email
      }
     })
    return newUser;
  }

  async register(registerUserDto: RegisterUserDto) {
    let { email, password, name, age, gender, address } = registerUserDto;
    let checkEmailExist = await this.userModel.findOne({ email: email });
    if (checkEmailExist) {
      throw new BadRequestException(`Email ${email} đã tồn tại. Vui lòng chọn email khác`)
    }
    const hashPassword = await this.getHashPassword(password);
    let user = await this.userModel.create({
      email: email,
      password: hashPassword,
      name: name,
      age: age,
      gender: gender,
      address: address,
      role: "USER"
    })
    return user;
  }

  findAll() {
    return this.userModel.find();
  }

  findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return 'not found user'
    }
    return this.userModel.findOne({ _id: id });

  }

  getUserByEmail(email: string) {
    return this.userModel.findOne({ email: email });
  }

  isCheckPassword(password: string, hash: string) {
    return compareSync(password, hash)
  }

  async update(updateUserDto: UpdateUserDto) {
    return await this.userModel.updateOne({ _id: updateUserDto._id }, { ...updateUserDto })
  }

  remove(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return 'not found user'
    }
    return this.userModel.softDelete({
      _id: id
    })
  }
}
