import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from 'src/feature/auth/auth.module';
import { SharedModule } from 'src/shared/shared.module';
import { ExpensesController } from './controller/expenses.controller';
import { GroupsController } from './controller/groups.controller';
import { Expense, ExpenseSchema } from './schema/expense.schema';
import { Group, GroupSchema } from './schema/group.schema';
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
    ]),
    AuthModule,
    SharedModule,
  ],
  controllers: [GroupsController, ExpensesController],
  providers: [GroupsService, ExpensesService],
})
export class GroupsModule {}
