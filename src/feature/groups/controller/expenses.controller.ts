import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from 'src/feature/auth/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/feature/auth/guard/jwt-auth.guard';
import { User } from 'src/feature/user/schema/user.schema';
import { CreateExpenseDto } from '../dto/create-expense.dto';
import { GetExpenseDto } from '../dto/get-expense.dto';
import { SettleExpenseDto } from '../dto/settle-expense.dto';
import { ExpensesService } from '../service/expenses.service';
import { GroupsService } from '../service/groups.service';

@Controller('expenses')
@UseGuards(JwtAuthGuard)
export class ExpensesController {
  constructor(
    private readonly groupsService: GroupsService,
    private readonly expensesService: ExpensesService,
  ) {}

  @HttpCode(200)
  @Post()
  async createExpense(
    @CurrentUser() user: User,
    @Body() createExpenseData: CreateExpenseDto,
  ) {
    return this.expensesService.createExpense(user, createExpenseData);
  }

  @Get()
  async getExpenses(@CurrentUser() user: User, @Query() query: GetExpenseDto) {
    return this.expensesService.getExpenses(user, query);
  }

  // @Get('balance')
  // async getBalance(@CurrentUser() user: User) {
  //   return { message: 'success' };
  // }

  @Put('settle')
  async settleExpense(
    @CurrentUser() user: User,
    @Body() settleExpenseData: SettleExpenseDto,
  ) {
    return this.expensesService.settleExpense(user, settleExpenseData);
  }
}
