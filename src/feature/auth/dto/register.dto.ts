import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @MaxLength(25)
  @MinLength(1)
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @MaxLength(60)
  @MinLength(6)
  @IsString()
  @IsNotEmpty()
  password: string;
}
