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
  firstname: string;

  @MaxLength(25)
  @MinLength(1)
  @IsString()
  @IsNotEmpty()
  lastname: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @MaxLength(60)
  @MinLength(6)
  @IsString()
  @IsNotEmpty()
  password: string;
}
