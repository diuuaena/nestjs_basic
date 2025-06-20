import { IsEmail, IsMongoId, IsNotEmpty } from "class-validator";
import mongoose from "mongoose";

export class CreateUserCvDto {
    @IsNotEmpty({ message: 'url không được để trống' })
    url: string;

    @IsNotEmpty({ message: 'companyId không được để trống' })
    @IsMongoId({ message: 'companyId không đúng định dạng' })
    companyId: mongoose.Schema.Types.ObjectId;

    @IsNotEmpty({ message: 'jobId không được để trống' })
    @IsMongoId({ message: 'jobId không đúng định dạng' })
    jobId: mongoose.Schema.Types.ObjectId;
}

export class CreateResumeDto {
    @IsNotEmpty({ message: 'Email không được để trống' })
    @IsEmail({ message: 'Email không đúng định dạng' })
    email: string;

    @IsNotEmpty({ message: 'userId không được để trống' })
    userId: mongoose.Schema.Types.ObjectId;

    @IsNotEmpty({ message: 'url không được để trống' })
    url: string;

    @IsNotEmpty({ message: 'Status không được để trống' })
    status: string;

    @IsNotEmpty({ message: 'companyId không được để trống' })
    companyId: mongoose.Schema.Types.ObjectId;

    @IsNotEmpty({ message: 'jobId không được để trống' })
    jobId: mongoose.Schema.Types.ObjectId;

}
