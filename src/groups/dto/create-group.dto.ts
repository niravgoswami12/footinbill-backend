import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateGroupDto {
  @MaxLength(25)
  @MinLength(1)
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  image: string;
}
