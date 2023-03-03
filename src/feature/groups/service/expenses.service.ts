import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Model } from 'mongoose';
import { User } from 'src/feature/user/schema/user.schema';
import { CreateExpenseDto } from '../dto/create-expense.dto';
import { GetExpenseDto } from '../dto/get-expense.dto';
import { Expense } from '../schema/expense.schema';
import { Group } from '../schema/group.schema';
import { GroupsService } from './groups.service';

@Injectable()
export class ExpensesService {
  constructor(
    private groupSerive: GroupsService,
    @InjectModel(Expense.name) private expenseModel: Model<Expense>,
  ) {}

  async createExpense(createExpenseData: CreateExpenseDto, currentUser: User) {
    // prepare Members list who are part of this expense
    const resultOfPaidById = createExpenseData.paidBy.map((p) => p.paidByUser);
    const resultOfSplitWithId = createExpenseData.splitWith.map(
      (p) => p.splitWithUser,
    );
    const members = Array.from(
      new Set([...resultOfPaidById, ...resultOfSplitWithId]),
    );
    let group: Group;
    if (createExpenseData.group) {
      group = await this.groupSerive.findOne(
        createExpenseData.group,
        currentUser.id,
      );
      // check group exist or not
      if (!group) {
        throw new BadRequestException('Group does not exist');
      }
      // check all expense members are part of group
      const groupMembersIds = group.members.map((f) => f.toString());
      if (resultOfPaidById.some((m) => !groupMembersIds.includes(m))) {
        throw new BadRequestException('paidBy users must be in this group');
      }
      if (resultOfSplitWithId.some((m) => !groupMembersIds.includes(m))) {
        throw new BadRequestException('splitWith users must be in this group');
      }
    } else {
      // check all expense members are part of friends of creator user
      const friendsIds = currentUser.friends.map((f) => f.toString());
      // add self user id to friend list to manage single self expense
      friendsIds.push(currentUser.id);

      console.log('friendsIds', friendsIds, members);
      if (resultOfPaidById.some((m) => !friendsIds.includes(m))) {
        throw new BadRequestException(
          'paidBy users must be in your friend list',
        );
      }
      if (resultOfSplitWithId.some((m) => !friendsIds.includes(m))) {
        throw new BadRequestException(
          'splitWith users must be in your friend list',
        );
      }
    }

    // paidByAmount validation
    const sum = createExpenseData.paidBy.reduce(
      (total, p) => total + p.paidByAmount,
      0,
    );
    if (createExpenseData.totalAmount != sum) {
      throw new BadRequestException(
        'The paidByAmount is different than total paid amount',
      );
    }
    // For future use function to split amount equally
    // const splitInteger = (num: number, parts: number): number[] => {
    //   const splitNums = [];
    //   const quotient = Math.floor(num / parts);
    //   const remainder = num % parts;
    //   for (let i = 0; i < parts; i++) {
    //     splitNums.push(quotient);
    //     if (i < remainder) {
    //       splitNums[i]++;
    //     }
    //   }
    //   return splitNums;
    // };

    // splitWithAmount validation: split equally
    if (createExpenseData.splitType == 'equally') {
      const splitWithAmountArr = createExpenseData.splitWith.map((p) => {
        return p.splitWithAmount;
      });
      const sum = splitWithAmountArr.reduce((total, p) => total + p, 0);
      const allEqual = (arr) =>
        arr.every((val) => Math.ceil(val) === Math.ceil(arr[0]));

      if (
        sum != createExpenseData.totalAmount ||
        !allEqual(splitWithAmountArr)
      ) {
        throw new BadRequestException(
          'splitWithAmount should be same for every member and their sum should be equal to split amount',
        );
      }
    }

    // splitWithAmount validation: split unequally > byExactAmount
    if (
      createExpenseData.splitType == 'unequally' &&
      createExpenseData.splitMethod == 'byExactAmount'
    ) {
      const sum = createExpenseData.splitWith.reduce(
        (total, p) => total + p.splitWithAmount,
        0,
      );
      if (createExpenseData.totalAmount != sum) {
        throw new BadRequestException(
          "Total of everyone's amount is different than total amount",
        );
      }
    }

    // splitWithAmount validation: split unequally > byPercentage
    if (
      createExpenseData.splitType == 'unequally' &&
      createExpenseData.splitMethod == 'byPercentage'
    ) {
      const sum = createExpenseData.splitWith.reduce(
        (total, p) => total + p.splitWithAmount,
        0,
      );
      if (createExpenseData.totalAmount != sum) {
        throw new BadRequestException(
          "Total of everyone's share is different than total amount",
        );
      }
    }

    const result = await this.expenseModel.create({
      members: members,
      description: createExpenseData.description,
      totalAmount: createExpenseData.totalAmount,
      paidBy: createExpenseData.paidBy,
      splitType: createExpenseData.splitType,
      splitMethod: createExpenseData.splitMethod,
      splitWith: createExpenseData.splitWith,
      group: createExpenseData.group,
      createdBy: currentUser,
    });
    return { message: 'Expense is created!', data: result };
  }

  async getExpenses(currentUser: User, query: GetExpenseDto) {
    console.log('createdBy', currentUser, query);
    // Get All Expenses documents in which you are member
    const expenseQueryObj: any = {
      //   $or: [
      //     { paidBy: { $elemMatch: { paidByUser: currentUser.id } } },
      //     { splitWith: { $elemMatch: { splitWithUser: currentUser.id } } },
      //   ],
    };
    if (query.groupId) {
      expenseQueryObj.group = query.groupId;
    } else {
      expenseQueryObj.group = { $exists: false };
    }
    const resultExpense = await this.expenseModel
      .find(expenseQueryObj, {
        createdBy: 1,
        createdAt: 1,
        description: 1,
        paidBy: 1,
        splitWith: 1,
        //   paidBy: { $elemMatch: { paidByUser: currentUser.id } },
        //   splitWith: { $elemMatch: { splitWithUser: currentUser.id } },
      })
      .populate('createdBy', { name: 1, _id: 1 })
      .populate('paidBy.paidByUser', { name: 1, _id: 1 })
      .populate('splitWith.splitWithUser', { name: 1, _id: 1 });
    const expenses = resultExpense.map((p) => {
      // Amount you Paid
      const paidAmountByCurrentUser = p.paidBy.reduce((total, p) => {
        return (
          total +
          (p.paidByUser._id.toString() === currentUser.id ? p.paidByAmount : 0)
        );
      }, 0);
      // Amount you need to pay
      const splitAmountByCurrentUser = p.splitWith.reduce(
        (total, p) =>
          total +
          (p.splitWithUser._id.toString() === currentUser.id
            ? p.splitWithAmount
            : 0),
        0,
      );
      const detailObject = {};

      detailObject[p.paidBy[0].paidByUser.id] = {
        name: p.paidBy[0].paidByUser.name,
        paid: p.paidBy[0].paidByAmount,
      };
      p.splitWith.forEach((m) => {
        detailObject[m.splitWithUser.id] = detailObject[m.splitWithUser.id]
          ? {
              ...detailObject[m.splitWithUser.id],
              owe: m.splitWithAmount,
            }
          : {
              name: m.splitWithUser.name,
              owe: m.splitWithAmount,
            };
      });

      const expenseItem = {
        id: p.id,
        date: p.createdAt,
        description: p.description,
        totalAmoun: p.totalAmount,
        createdByName: p.createdBy.name,
        allDetails: detailObject,
        detailsPaid: {},
        detailsSplit: {},
      };
      if (paidAmountByCurrentUser > splitAmountByCurrentUser) {
        // you paid more then your share and you lent to someone
        expenseItem.detailsPaid = {
          message: 'you paid',
          amount: Math.abs(paidAmountByCurrentUser),
        };
        expenseItem.detailsSplit = {
          message: 'you lent ',
          amount: Math.abs(paidAmountByCurrentUser - splitAmountByCurrentUser),
        };
      } else {
        // you paid nothing and you owe some amount to someone
        const paidName = p.paidBy[0]?.paidByUser.name.toString();
        const paidAmount = p.paidBy[0]?.paidByAmount;

        expenseItem.detailsPaid = {
          message: paidName + ' paid',
          amount: Math.abs(paidAmount),
        };
        expenseItem.detailsSplit = {
          message: splitAmountByCurrentUser
            ? paidName + ' lent you'
            : 'Not involved',
          amount: Math.abs(splitAmountByCurrentUser),
        };
      }
      return expenseItem;
    });
    return { data: expenses };
  }
}
