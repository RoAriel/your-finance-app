import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { AppLogger } from '../common/utils/logger.util';
import { TransferDto } from './dto/transfer.dto';
import { TransactionType } from '../transactions/dto/create-transaction.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { DepositDto } from './dto/deposit.dto';
// 👇 IMPORTANTE: Necesitamos esto para crear la categoría si no existe
import { CategoryType } from '@prisma/client';

@Injectable()
export class AccountsService {
  private readonly logger = new AppLogger(AccountsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateAccountDto, userId: string) {
    const operation = 'Crear Cuenta';
    try {
      this.logger.logOperation(operation, { userId, type: dto.type });

      const account = await this.prisma.account.create({
        data: {
          ...dto,
          userId,
          balance: 0,
        },
      });

      this.logger.logSuccess(operation, { id: account.id });
      return account;
    } catch (error) {
      this.logger.logFailure(operation, error as Error);
      throw error;
    }
  }

  async findAll(userId: string) {
    const operation = 'Listar Cuentas';
    try {
      this.logger.logOperation(operation, { userId });

      const accounts = await this.prisma.account.findMany({
        where: { userId },
        orderBy: { createdAt: 'asc' },
      });

      this.logger.logSuccess(operation, { count: accounts.length });

      return accounts.map((acc) => {
        const balance = Number(acc.balance);
        const targetAmount = acc.targetAmount ? Number(acc.targetAmount) : 0;
        let progress = 0;

        if (targetAmount > 0) {
          progress = Math.min((balance / targetAmount) * 100, 100);
        }

        return {
          ...acc,
          balance,
          targetAmount: targetAmount > 0 ? targetAmount : null,
          progress: Math.round(progress),
        };
      });
    } catch (error) {
      this.logger.logFailure(operation, error as Error);
      throw error;
    }
  }

  async deposit(accountId: string, dto: DepositDto, userId: string) {
    const operation = 'Depositar Fondos';
    const { amount, description } = dto;

    try {
      this.logger.logOperation(operation, { accountId, amount });

      const account = await this.prisma.account.findUnique({
        where: { id: accountId },
      });

      if (!account) throw new NotFoundException('Account not found');
      if (account.userId !== userId)
        throw new ForbiddenException('Not your account');

      const result = await this.prisma.$transaction(async (tx) => {
        const updatedAccount = await tx.account.update({
          where: { id: accountId },
          data: { balance: { increment: amount } },
        });

        await tx.transaction.create({
          data: {
            amount: amount,
            description: description || 'Depósito manual',
            date: new Date(),
            type: TransactionType.INCOME,
            userId,
            accountId: accountId,
            currency: account.currency,
          },
        });

        return updatedAccount;
      });

      this.logger.logSuccess(operation, { newBalance: result.balance });
      return result;
    } catch (error) {
      this.logger.logFailure(operation, error as Error);
      throw error;
    }
  }

  async transfer(dto: TransferDto, userId: string) {
    const operation = 'Transferencia';
    const { sourceAccountId, targetAccountId, amount, description, date } = dto;

    try {
      this.logger.logOperation(operation, dto);

      if (sourceAccountId === targetAccountId) {
        throw new BadRequestException('Cannot transfer to the same account');
      }

      const sourceAccount = await this.prisma.account.findUnique({
        where: { id: sourceAccountId },
      });
      const targetAccount = await this.prisma.account.findUnique({
        where: { id: targetAccountId },
      });

      if (!sourceAccount || !targetAccount)
        throw new NotFoundException('Accounts not found');
      if (sourceAccount.userId !== userId)
        throw new ForbiddenException('Not owner of source account');

      if (sourceAccount.currency !== targetAccount.currency) {
        throw new BadRequestException('Currency mismatch');
      }

      if (Number(sourceAccount.balance) < amount) {
        throw new BadRequestException('Insufficient funds');
      }

      // 👇 LOGICA NUEVA: Buscar o crear la categoría "Transferencia"
      let transferCategory = await this.prisma.category.findFirst({
        where: {
          userId,
          name: 'Transferencia',
        },
      });

      if (!transferCategory) {
        transferCategory = await this.prisma.category.create({
          data: {
            name: 'Transferencia',
            icon: 'ArrowRightLeft',
            color: '#64748B',
            type: CategoryType.EXPENSE,
            isFixed: false,
            userId,
          },
        });
      }

      const transactionDate = date ? new Date(date) : new Date();

      const result = await this.prisma.$transaction(async (tx) => {
        // 1. Restar Origen
        const updatedSource = await tx.account.update({
          where: { id: sourceAccountId },
          data: { balance: { decrement: amount } },
        });

        // 2. Transaction Salida
        await tx.transaction.create({
          data: {
            amount: amount,
            description: `Transferencia a: ${targetAccount.name}`,
            date: transactionDate,
            type: TransactionType.TRANSFER,
            userId,
            accountId: sourceAccountId,
            currency: sourceAccount.currency,
            categoryId: transferCategory.id, // 👈 ASIGNAMOS CATEGORÍA
          },
        });

        // 3. Sumar Destino
        const updatedTarget = await tx.account.update({
          where: { id: targetAccountId },
          data: { balance: { increment: amount } },
        });

        // 4. Transaction Entrada
        await tx.transaction.create({
          data: {
            amount: amount,
            description: description
              ? `Recibido: ${description}`
              : `Desde: ${sourceAccount.name}`,
            date: transactionDate,
            type: TransactionType.INCOME,
            userId,
            accountId: targetAccountId,
            currency: targetAccount.currency,
            categoryId: transferCategory.id, // 👈 ASIGNAMOS CATEGORÍA
          },
        });

        return { source: updatedSource, target: updatedTarget };
      });

      this.logger.logSuccess(operation, { amount });
      return result;
    } catch (error) {
      this.logger.logFailure(operation, error as Error);
      throw error;
    }
  }

  async remove(userId: string, id: string) {
    const account = await this.prisma.account.findFirst({
      where: { id, userId },
    });

    if (!account) throw new NotFoundException('Account not found');

    if (account.isDefault) {
      throw new BadRequestException('Cannot delete default account');
    }

    return this.prisma.account.delete({
      where: { id },
    });
  }

  async update(userId: string, id: string, dto: UpdateAccountDto) {
    const account = await this.prisma.account.findFirst({
      where: { id, userId },
    });

    if (!account) throw new NotFoundException('Account not found');

    return this.prisma.account.update({
      where: { id },
      data: dto,
    });
  }
}
