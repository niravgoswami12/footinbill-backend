import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsDefined,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { SplitMethod, SplitType } from '../schema/expense.schema';

class PaidBy {
  @IsMongoId()
  @IsString()
  @IsNotEmpty()
  paidByUser: string;

  @IsPositive()
  @IsNumber()
  @IsNotEmpty()
  paidByAmount: number;
}

class SplitWith {
  @IsMongoId()
  @IsString()
  @IsNotEmpty()
  splitWithUser: string;

  @IsPositive()
  @IsNumber()
  @IsNotEmpty()
  splitWithAmount: number;
}

export class CreateExpenseDto {
  @IsPositive()
  @IsNumber()
  @IsDefined()
  totalAmount: number;

  @MaxLength(300)
  @IsNotEmpty()
  description: string;

  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMaxSize(1)
  @ArrayMinSize(1)
  @Type(() => PaidBy)
  paidBy: PaidBy[];

  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @Type(() => SplitWith)
  splitWith: SplitWith[];

  @IsEnum(SplitType, {
    message:
      'splitType must be one of the following values: equally, unequally',
  })
  @IsString()
  @IsNotEmpty()
  splitType: string;

  @IsEnum(SplitMethod, {
    message:
      'splitMethod must be one of the following values: byExactAmount, byPercentage',
  })
  @IsString()
  @IsNotEmpty()
  @ValidateIf((o) => o.splitType === 'unequally')
  splitMethod: string;

  @IsMongoId()
  @IsString()
  @IsOptional()
  group: string;
}
