import { IsEmail, IsNotEmpty, MinLength, Matches } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateAuthDto {
    @IsNotEmpty({ message: 'Phone number is required' })
    @Transform(({ value }) => value?.trim())
    @Matches(/^01\d{9}$/, {
        message: 'Phone number must be 11 digits and start with 01',
    })
    phoneNumber: string;


}
