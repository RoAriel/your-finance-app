import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { QueryTransactionDto } from './dto/query-transaction.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { UserPayload } from '../auth/interfaces/user-payload.interface';
import { PaginatedResult } from '../common/dto/pagination.dto';
import { Transaction } from '@prisma/client';

import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('transactions')
@ApiBearerAuth()
@Controller('transactions')
@UseGuards(JwtAuthGuard)
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new transaction' })
  @ApiResponse({
    status: 201,
    description: 'The transaction has been successfully created.',
    type: CreateTransactionDto,
  })
  create(
    @CurrentUser() user: UserPayload,
    @Body() createTransactionDto: CreateTransactionDto,
  ) {
    return this.transactionsService.create(createTransactionDto, user.id);
  }

  @Get()
  async findAll(
    @Query() query: QueryTransactionDto,
    @CurrentUser('id') userId: string,
  ): Promise<PaginatedResult<Transaction>> {
    return this.transactionsService.findAll(query, userId);
  }

  @Get('balance')
  getBalance(@CurrentUser() user: UserPayload) {
    return this.transactionsService.getBalance(user.id);
  }

  @Get(':id')
  findOne(
    @CurrentUser() user: UserPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.transactionsService.findOne(user.id, id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: UserPayload,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTransactionDto: UpdateTransactionDto,
  ) {
    return this.transactionsService.update(user.id, updateTransactionDto, id);
  }

  @Delete(':id')
  remove(
    @CurrentUser() user: UserPayload,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.transactionsService.remove(user.id, id);
  }
}
