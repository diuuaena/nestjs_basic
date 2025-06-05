import { Injectable } from '@nestjs/common';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { InjectModel } from '@nestjs/mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { Company, CompanyDocument } from './schemas/company.schema';
import { IUser } from 'src/users/users.interface';

@Injectable()
export class CompaniesService {
  constructor(@InjectModel(Company.name) private readonly companyModel:  SoftDeleteModel<CompanyDocument>) {}

  async create(createCompanyDto: CreateCompanyDto, user: IUser) {
    let companies = await this.companyModel.create({
      name: createCompanyDto.name, 
      address: createCompanyDto.address, 
      description: createCompanyDto.description,
      createdBy: {
        _id: user._id,
        email: user.email
      }
    })
    return companies
  }

  findAll() {
    return `This action returns all companies`;
  }

  findOne(id: number) {
    return `This action returns a #${id} company`;
  }

  async update(id: string, updateCompanyDto: UpdateCompanyDto, user: IUser) {
    return await this.companyModel.updateOne(
      {_id: id},
      {...updateCompanyDto,
        updatedBy: {
          _id: user._id,
          email: user.email
        }
      } 
    )
  }

  async remove(id: string, user: IUser) {
    
    await this.companyModel.updateOne(
      {_id: id},
      {
        deletedBy: {
          _id: user._id,
          email: user.email
        }
      } 
    )
    return this.companyModel.softDelete(
      {_id : id}
    )
  }
}
