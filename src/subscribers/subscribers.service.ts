import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateSubscriberDto } from './dto/create-subscriber.dto';
import { UpdateSubscriberDto } from './dto/update-subscriber.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Subscriber, SubscriberDocument } from './schemas/subscriber.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { IUser } from 'src/users/users.interface';
import aqp from 'api-query-params';
import mongoose from 'mongoose';

@Injectable()
export class SubscribersService {
  constructor(@InjectModel(Subscriber.name) private readonly subscriberModel: SoftDeleteModel<SubscriberDocument>) { }

  async create(createSubscriberDto: CreateSubscriberDto, user: IUser) {
    let isExist = await this.subscriberModel.findOne({ email: user.email })
    if (isExist)
      throw new BadRequestException(`email ${user.email} đã tồn tại trong hệ thống`)
    let newSubscriber = await this.subscriberModel.create({
      email: user.email,
      name: user.name,
      ...createSubscriberDto,
      createdBy: {
        _id: user._id,
        email: user.email
      }
    })
    return {
      _id: newSubscriber?._id,
      createdAt: newSubscriber?.createdAt,
    };
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, population, projection } = aqp(qs);
    delete filter.current;
    delete filter.pageSize;
    let offset = (currentPage - 1) * (+limit);
    let defaultLimit = +limit ? +limit : 10;

    const totalItems = (await this.subscriberModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.subscriberModel.find(filter)
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
    return this.subscriberModel.findOne({ _id: id })
  }

  async update(updateSubscriberDto: UpdateSubscriberDto, user: IUser) {
    // update thông tin company
    return await this.subscriberModel.updateOne(
      { email: user.email },
      {
        ...updateSubscriberDto,
        updatedBy: {
          _id: user._id,
          email: user.email
        }
      },
      { upsert: true }
    )
  }

  async remove(id: string, user: IUser) {
    // check format id
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestException("id không hợp lệ")
    }

    const subscriber = await this.subscriberModel.findOne({ _id: id })
    if (!subscriber)
      throw new NotFoundException("không tìm thấy subscriber trong hệ thống")

    await this.subscriberModel.updateOne(
      { _id: id },
      {
        deletedBy: {
          _id: user._id,
          email: user.email,
        }
      }
    )

    return this.subscriberModel.softDelete(
      { _id: id }
    )

  }

  async getSkills(user: IUser) {
    const {email} = user;
    return await this.subscriberModel.findOne({email: email}, {skills: 1})
  }
}
