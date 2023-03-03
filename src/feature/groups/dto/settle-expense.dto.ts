import {
  IsDefined,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';

export class SettleExpenseDto {
  @IsMongoId()
  @IsString()
  payer: string;

  @IsMongoId()
  @IsString()
  recipient: string;

  @IsPositive()
  @IsNumber()
  @IsDefined()
  settleAmount: number;

  @MaxLength(300)
  @IsNotEmpty()
  @IsOptional()
  description: string;

  @IsMongoId()
  @IsString()
  expense: string;
}
