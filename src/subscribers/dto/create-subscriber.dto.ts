import { IsArray, IsEmail, IsNotEmpty, IsString } from "class-validator";

export class CreateSubscriberDto {

    @IsArray({ message: 'Skill phải là một array' })
    @IsString({ each: true, message: "skill định dạng là string" })
    skills: string;
}
