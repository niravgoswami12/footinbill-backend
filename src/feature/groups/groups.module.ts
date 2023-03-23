import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from 'src/feature/auth/auth.module';
import { SharedModule } from 'src/shared/shared.module';
import { ActivitiesController } from './controller/activities.controller';
import { ExpensesController } from './controller/expenses.controller';
import { GroupsController } from './controller/groups.controller';
import { Activity, ActivitySchema } from './schema/activity.schema';
import { Expense, ExpenseSchema } from './schema/expense.schema';
import { Group, GroupSchema } from './schema/group.schema';
import { Settle, SettleSchema } from './schema/settle.schema';
import { ActivitiesService } from './service/activities.service';
import { ExpensesService } from './service/expenses.service';
import { GroupsService } from './service/groups.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Group.name,
        schema: GroupSchema,
      },
      {
        name: Expense.name,
        schema: ExpenseSchema,
      },
      {
        name: Settle.name,
        schema: SettleSchema,
      },
      {
        name: Activity.name,
        schema: ActivitySchema,
      },
    ]),
    AuthModule,
    SharedModule,
  ],
  controllers: [GroupsController, ExpensesController, ActivitiesController],
  providers: [GroupsService, ExpensesService, ActivitiesService],
})
export class GroupsModule {}
