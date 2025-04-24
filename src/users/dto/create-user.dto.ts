import { IsEmail, IsNotEmpty } from 'class-validator';

export class CreateUserDto {
    @IsEmail()
    @IsNotEmpty()
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
