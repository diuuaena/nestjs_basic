import { PartialType } from '@nestjs/mapped-types';
import { CreateJobDto } from './create-job.dto';
import { IsBoolean, IsNotEmpty } from 'class-validator';

export class UpdateJobDto extends PartialType(CreateJobDto) {
    @IsNotEmpty({ message: 'isActive không được để trống' })
    @IsBoolean({ message: 'isActive có định dạng là boolean' })
    isActive: boolean;
}
