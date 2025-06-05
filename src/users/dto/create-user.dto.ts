import { IsEmail, IsNotEmpty } from 'class-validator';

export class CreateUserDto {
    @IsEmail({}, { message: 'Email không đúng định dạng'})
    @IsNotEmpty({ message: 'Email không được để trống'})
    email: string;

    @IsNotEmpty()
    password: string;

    name: string;

    age: number;

    address :string;

    phone: string;

    createdAt: Date;
    
    updatedAt: Date;
}
