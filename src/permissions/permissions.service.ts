import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { IUser } from 'src/users/users.interface';
import { Permission, PermissionDocument } from './schemas/permission.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { InjectModel } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import aqp from 'api-query-params';

@Injectable()
export class PermissionsService {
  constructor(@InjectModel(Permission.name) private readonly permissionModel: SoftDeleteModel<PermissionDocument>) { }

  async create(createPermissionDto: CreatePermissionDto, user: IUser) {
    let checkExist = await this.permissionModel.findOne({
      apiPath: createPermissionDto.apiPath,
      method: createPermissionDto.method,
    })
    if (checkExist)
      throw new BadRequestException(`Permission với apiPath: ${createPermissionDto.apiPath} và method: ${createPermissionDto.method} đã tồn tại`)
    let permission = await this.permissionModel.create({
      ...createPermissionDto,
      createdBy: {
        _id: user._id,
        email: user.email
      }
    })
    return {
      _id: permission._id,
      createdAt: permission.createdAt,
    }
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, population, projection } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;
    let offset = (currentPage - 1) * (+limit);
    let defaultLimit = +limit ? +limit : 10;

    const totalItems = (await this.permissionModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.permissionModel.find(filter)
      .skip(offset)
      .limit(defaultLimit)
      // @ts-ignore: Unreachable code error
      .sort(sort)
      .populate(population)
      .select(projection)
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
      throw new BadRequestException("id không hợp lệ")
    }
    return await this.permissionModel.findOne({_id: id})
  }

  async update(id: string, updatePermissionDto: UpdatePermissionDto, user: IUser) {
    // check format id
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException("id không hợp lệ")
    }

    const permission = await this.permissionModel.findOne({ _id: id })
    if (!permission)
      throw new NotFoundException("không tìm thấy company trong hệ thống")

    return await this.permissionModel.updateOne(
      { _id: id },
      {
        ...updatePermissionDto,
        updatedBy: {
          _id: user._id,
          email: user.email
        }
      }
    )
  }

  async remove(id: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException("id không hợp lệ")
    }

    const permission = await this.permissionModel.findOne({ _id: id })
    if (!permission)
      throw new NotFoundException("không tìm thấy permission trong hệ thống")

    await this.permissionModel.updateOne(
      { _id: id },
      {
        deletedBy: {
          _id: user._id,
          email: user.email
        }
      }
    )
    return this.permissionModel.softDelete({_id: id})
  }
}
