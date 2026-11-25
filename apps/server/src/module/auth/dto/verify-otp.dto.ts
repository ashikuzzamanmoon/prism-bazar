import { IsNotEmpty, Matches, Length } from 'class-validator'
import { Transform } from 'class-transformer'

export class VerifyOtpDto {
    @IsNotEmpty({ message: 'Phone number is required' })
    @Transform(({ value }) => value?.trim())
    @Matches(/^01\d{9}$/, {
        message: 'Phone number must be 11 digits and start with 01',
    })
    phoneNumber: string

    @IsNotEmpty({ message: 'OTP code is required' })
    @Transform(({ value }) => value?.toString().trim())
    @Matches(/^\d{4}$/, {
        message: 'OTP code must be exactly 4 digits',
    })
    code: string
}
