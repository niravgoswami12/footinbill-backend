import { IsOptional, IsPositive } from 'class-validator';

export class GetActivitiesDto {
  @IsPositive()
  @IsOptional()
  page: number;

  @IsPositive()
  @IsOptional()
  limit: number;
}
