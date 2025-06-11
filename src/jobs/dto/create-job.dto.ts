import { Type } from 'class-transformer';
import { IsArray, IsDate, IsDateString, IsNotEmpty, IsNotEmptyObject, IsObject, IsString, ValidateNested } from 'class-validator';
import mongoose from 'mongoose';

class Company {
    @IsNotEmpty()
    _id: mongoose.Schema.Types.ObjectId;

    @IsNotEmpty()
    companyName: string
}

export class CreateJobDto {
    @IsNotEmpty({ message: 'Name không được để trống' })
    name: string;

    @IsArray({ message: 'Skill phải là một array' })
    @IsString({each: true, message: "skill định dạng là string"})
    skills: string;

    @IsNotEmptyObject()
    @IsObject()
    @ValidateNested()
    @Type(() => Company)
    company: Company;

    @IsNotEmpty({ message: 'Salary không được để trống' })
    salary: number;

    @IsNotEmpty({ message: 'Quantity không được để trống' })
    quantity: number;

    @IsNotEmpty({ message: 'Level không được để trống' })
    level: string;

    @IsNotEmpty({ message: 'Description không được để trống' })
    description: string;

    @IsNotEmpty({ message: 'StartDate không được để trống' })
    @Type(() => Date)
    @IsDate({message: "startDate định dạng là Date"})
    startDate: Date;

    @IsNotEmpty({ message: 'EndDate không được để trống' })
    @Type(() => Date)
    @IsDate({message: "endDate định dạng là Date"})
    endDate: Date;
}
