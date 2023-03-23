import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from 'src/feature/auth/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/feature/auth/guard/jwt-auth.guard';
import { User } from 'src/feature/user/schema/user.schema';
import { GetActivitiesDto } from '../dto/get-activities.dto';
import { ActivitiesService } from '../service/activities.service';

@Controller('activities')
@UseGuards(JwtAuthGuard)
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Get()
  async getActivities(
    @CurrentUser() user: User,
    @Query() query: GetActivitiesDto,
  ) {
    return this.activitiesService.getActivities(user, query);
  }
}
