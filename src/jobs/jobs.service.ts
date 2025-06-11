import { BadRequestException, Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { IUser } from 'src/users/users.interface';
import { Job, JobDocument } from './schemas/job.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { InjectModel } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import aqp from 'api-query-params';

@Injectable()
export class JobsService {
  constructor(@InjectModel(Job.name) private readonly jobModel: SoftDeleteModel<JobDocument>) { }

  async create(createJobDto: CreateJobDto, user: IUser) {
    if (createJobDto.endDate < createJobDto.startDate)
      throw new BadRequestException("endDate phải lớn hoặc bằng hơn startDate")
    let newJob = await this.jobModel.create({
      ...createJobDto,
      isActive: true,
      createdBy: {
        _id: user._id,
        email: user.email
      }
    })
    return {
      _id: user._id,
      createdAt: newJob?.createdAt,
    };
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, population } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;
    let offset = (currentPage - 1) * (+limit);
    let defaultLimit = +limit ? +limit : 10;

    const totalItems = (await this.jobModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.jobModel.find(filter)
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
    return await this.jobModel.findOne({ _id: id });
  }

  async update(id: string, updateJobDto: UpdateJobDto, user: IUser) {
    // check format id
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new UnprocessableEntityException("id không hợp lệ")
    }
    // check tồn tại của company
    const job = await this.jobModel.findOne({ _id: id })
    if (!job)
      throw new NotFoundException("không tìm thấy job trong hệ thống")
    // update thông tin job
    return await this.jobModel.updateOne(
      { _id: id },
      {
        ...updateJobDto,
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
    await this.jobModel.updateOne(
      { _id: id },
      {
        deletedBy: {
          _id: user._id,
          email: user.email
        }
      }
    )
    return this.jobModel.softDelete({
      _id: id
    })
  }
}
