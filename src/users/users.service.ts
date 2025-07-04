import { BadRequestException, Injectable, UnprocessableEntityException } from '@nestjs/common';
import { CreateUserDto, RegisterUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import mongoose, { Model } from 'mongoose';
import { compareSync, genSaltSync, hashSync } from "bcryptjs";
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { IUser } from './users.interface';
import aqp from 'api-query-params';
import { Role, RoleDocument } from 'src/roles/schemas/role.schema';
import { USER_ROLE } from 'src/databases/sample';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private readonly userModel: SoftDeleteModel<UserDocument>,
    @InjectModel(Role.name) private readonly roleModel: SoftDeleteModel<RoleDocument>
) { }

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
    const userRole = await this.roleModel.findOne({name: USER_ROLE});
    const hashPassword = await this.getHashPassword(password);
    let user = await this.userModel.create({
      email: email,
      password: hashPassword,
      name: name,
      age: age,
      gender: gender,
      address: address,
      role: userRole?._id
    })
    return user;
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, population } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;
    let offset = (currentPage - 1) * (+limit);
    let defaultLimit = +limit ? +limit : 10;

    const totalItems = (await this.userModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.userModel.find(filter)
      .skip(offset)
      .limit(defaultLimit)
      // @ts-ignore: Unreachable code error
      .sort(sort)
      .populate(population)
      .exec();

    return {
      meta: {
        current: currentPage, //trang hiện tại
        pageSize: limit, //số lượng bản ghi đã lấy
        pages: totalPages,  //tổng số trang với điều kiện query
        total: totalItems // tổng số phần tử (số bản ghi)
      },
      result //kết quả query
    }
  }

  async findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new UnprocessableEntityException("id không hợp lệ")
    }
    return await this.userModel.findOne({ _id: id })
    .select("-password")
    .populate({path: "role", select: {
      name: 1,
      _id: 1
    }});
  }

  getUserByEmail(email: string) {
    return this.userModel.findOne({ email: email })
    .populate({path: "role", select: {
      name: 1,
    }});
  }

  isCheckPassword(password: string, hash: string) {
    return compareSync(password, hash)
  }

  async update(id: string, updateUserDto: UpdateUserDto, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new UnprocessableEntityException("id không hợp lệ")
    }
    return await this.userModel.updateOne(
      { _id: id },
      {
        ...updateUserDto,
        updatedBy: {
          _id: user._id,
          email: user.email
        }
      }
    )
  }

  async remove(id: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new UnprocessableEntityException("id không hợp lệ")
    }
    const foundUser = await this.userModel.findById(id);
    if (foundUser && foundUser.email === "admin@gmail.com") {
      throw new BadRequestException("Không thể xóa tài khoản admin")
    }
    await this.userModel.updateOne(
      { _id: id },
      {
        deletedBy: {
          _id: user._id,
          email: user.email
        }
      }
    )
    return this.userModel.softDelete({
      _id: id
    })
  }

  updateUserToken = async (refreshToken: string, _id: string) => {
    if (!mongoose.Types.ObjectId.isValid(_id)) {
      throw new UnprocessableEntityException("id không hợp lệ")
    }
    return await this.userModel.updateOne(
      { _id },
      {
        refreshToken
      }
    )
  }

  findUserByRefreshToken = async (refreshToken: string) => {
    return await this.userModel.findOne({ refreshToken })
    .populate({
      path: "role",
      select: { name: 1},
    });
  }
}
