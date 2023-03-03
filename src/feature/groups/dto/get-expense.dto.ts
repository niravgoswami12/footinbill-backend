import { IsMongoId, IsOptional, IsString } from 'class-validator';

export class GetExpenseDto {
  @IsMongoId()
  @IsString()
  @IsOptional()
  groupId: string;
}
