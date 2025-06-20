import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateResumeDto, CreateUserCvDto } from './dto/create-resume.dto';
import { UpdateResumeDto } from './dto/update-resume.dto';
import { IUser } from 'src/users/users.interface';
import { Resume, ResumeDocument } from './schemas/resume.schema';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import aqp from 'api-query-params';
import mongoose from 'mongoose';

@Injectable()
export class ResumesService {
  constructor(@InjectModel(Resume.name) private readonly resumeModel: SoftDeleteModel<ResumeDocument>) { }
  async create(createUserCvDto: CreateUserCvDto, user: IUser) {
    let userCV = await this.resumeModel.create({
      email: user.email,
      userId: user._id,
      status: "PENDING",
      history: [{
        status: "PENDING",
        updatedAt: new Date,
        updatedBy: {
          _id: user._id,
          email: user.email
        }
      }],
      ...createUserCvDto,
      createdBy: {
        _id: user._id,
        email: user.email
      }
    })
    return {
      _id: userCV._id,
      createdAt: userCV.createdAt,
    }

  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, population, projection } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;
    let offset = (currentPage - 1) * (+limit);
    let defaultLimit = +limit ? +limit : 10;

    const totalItems = (await this.resumeModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.resumeModel.find(filter)
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

  findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException("id không hợp lệ")
    }
    return this.resumeModel.findOne({ _id: id })
  }

  async update(id: string, updateResumeDto: UpdateResumeDto, user: IUser) {
    // check format id
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException("id không hợp lệ")
    }
    // check tồn tại của company
    const resume = await this.resumeModel.findOne({ _id: id })
    if (!resume)
      throw new NotFoundException("không tìm thấy company trong hệ thống")
    // update thông tin company
    return await this.resumeModel.updateOne(
      { _id: id },
      {
        ...updateResumeDto,
        $push: {
          history: {
            status: updateResumeDto.status,
            updatedAt: new Date,
            updatedBy: {
              _id: user._id,
              email: user.email
            }
          }
        },
        updatedBy: {
          _id: user._id,
          email: user.email
        }
      }
    )
  }

  async remove(id: string, user: IUser) {
    // check format id
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException("id không hợp lệ")
    }
    // check tồn tại của company
    const company = await this.resumeModel.findOne({ _id: id })
    if (!company)
      throw new NotFoundException("không tìm thấy company trong hệ thống")
    // update deleteBy của company
    await this.resumeModel.updateOne(
      { _id: id },
      {
        deletedBy: {
          _id: user._id,
          email: user.email
        }
      }
    )
    // softDelete company
    return this.resumeModel.softDelete(
      { _id: id }
    )
  }

  async getResumeByUser(user: IUser) {
    return this.resumeModel.find({ userId: user._id })
  }
}
