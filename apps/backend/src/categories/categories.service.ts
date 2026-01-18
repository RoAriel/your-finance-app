// src/categories/categories.service.ts

import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Category } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { QueryCategoryDto } from './dto/query-category.dto';
import { AppLogger } from '../common/utils/logger.util';
import {
  PaginatedResult,
  createPaginatedResponse,
} from '../common/dto/pagination.dto';

@Injectable()
export class CategoriesService {
  private readonly logger = new AppLogger(CategoriesService.name);

  constructor(private prisma: PrismaService) {}

  async seed(userId: string) {
    this.logger.log(`Seeding default categories for user: ${userId}`);

    const existingCategories = await this.prisma.category.findMany({
      where: { userId, deletedAt: null },
    });

    if (existingCategories.length > 0) {
      this.logger.log(
        `User ${userId} already has ${existingCategories.length} categories`,
      );
      return {
        message: 'Categories already exist',
        categories: existingCategories,
      };
    }

    const defaultCategories = [
      // GASTOS
      {
        name: 'Supermercado',
        type: 'expense' as const,
        color: '#FF6B6B',
        icon: 'shopping-cart',
      },
      {
        name: 'Transporte',
        type: 'expense' as const,
        color: '#4ECDC4',
        icon: 'car',
      },
      {
        name: 'Salud',
        type: 'expense' as const,
        color: '#95E1D3',
        icon: 'heart',
      },
      {
        name: 'Entretenimiento',
        type: 'expense' as const,
        color: '#F38181',
        icon: 'film',
      },
      {
        name: 'Servicios',
        type: 'expense' as const,
        color: '#AA96DA',
        icon: 'zap',
      },
      {
        name: 'Restaurantes',
        type: 'expense' as const,
        color: '#FCBAD3',
        icon: 'coffee',
      },
      {
        name: 'Educación',
        type: 'expense' as const,
        color: '#A8D8EA',
        icon: 'book',
      },
      {
        name: 'Ropa',
        type: 'expense' as const,
        color: '#FFD93D',
        icon: 'shopping-bag',
      },

      // INGRESOS
      {
        name: 'Salario',
        type: 'income' as const,
        color: '#6BCF7F',
        icon: 'briefcase',
      },
      {
        name: 'Freelance',
        type: 'income' as const,
        color: '#4D96FF',
        icon: 'code',
      },
      {
        name: 'Inversiones',
        type: 'income' as const,
        color: '#FFB830',
        icon: 'trending-up',
      },
      {
        name: 'Bonos',
        type: 'income' as const,
        color: '#C780FA',
        icon: 'gift',
      },

      // AMBOS
      {
        name: 'Otros',
        type: 'both' as const,
        color: '#95A5A6',
        icon: 'more-horizontal',
      },
    ];

    try {
      const createdCategories = await Promise.all(
        defaultCategories.map((category) =>
          this.prisma.category.create({
            data: {
              ...category,
              userId,
            },
          }),
        ),
      );

      this.logger.logSuccess('Seed categories', {
        userId,
        count: createdCategories.length,
      });

      return {
        message: 'Default categories created successfully',
        categories: createdCategories,
      };
    } catch (error) {
      this.logger.logFailure('Seed categories', error as Error);
      throw error;
    }
  }

  async create(dto: CreateCategoryDto, userId: string) {
    this.logger.logOperation('Create category', {
      name: dto.name,
      type: dto.type,
      userId,
    });

    const existing = await this.prisma.category.findFirst({
      where: {
        name: dto.name,
        type: dto.type,
        userId,
        deletedAt: null,
      },
    });

    if (existing) {
      this.logger.warn(
        `Duplicate category attempt: ${dto.name} (${dto.type}) by user ${userId}`,
      );
      throw new ConflictException(
        `Category "${dto.name}" with type "${dto.type}" already exists`,
      );
    }

    try {
      const category = await this.prisma.category.create({
        data: {
          ...dto,
          userId,
        },
      });

      this.logger.logSuccess('Create category', {
        id: category.id,
        name: category.name,
      });
      return category;
    } catch (error) {
      this.logger.logFailure('Create category', error as Error);
      throw error;
    }
  }

  async findAll(
    query: QueryCategoryDto,
    userId: string,
  ): Promise<PaginatedResult<Category>> {
    this.logger.log(
      `Finding categories for user ${userId} with filters: ${JSON.stringify(query)}`,
    );

    const { page = 1, limit = 20, type } = query;

    const where: any = {
      userId,
      deletedAt: null,
    };

    if (type && type !== 'both') {
      where.OR = [{ type }, { type: 'both' }];
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.category.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      this.prisma.category.count({ where }),
    ]);

    this.logger.log(
      `Found ${data.length} of ${total} categories for user ${userId}`,
    );

    return createPaginatedResponse(data, total, page, limit);
  }

  async findOne(id: string, userId: string) {
    this.logger.log(`Finding category ${id} for user ${userId}`);

    const category = await this.prisma.category.findFirst({
      where: {
        id,
        userId,
        deletedAt: null,
      },
    });

    if (!category) {
      this.logger.warn(`Category ${id} not found for user ${userId}`);
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async update(id: string, dto: UpdateCategoryDto, userId: string) {
    this.logger.logOperation('Update category', { id, updates: dto, userId });

    await this.findOne(id, userId);

    if (dto.name) {
      const existing = await this.prisma.category.findFirst({
        where: {
          name: dto.name,
          userId,
          deletedAt: null,
          NOT: { id },
        },
      });

      if (existing) {
        this.logger.warn(
          `Duplicate category name in update: ${dto.name} by user ${userId}`,
        );
        throw new ConflictException(`Category "${dto.name}" already exists`);
      }
    }

    try {
      const category = await this.prisma.category.update({
        where: { id },
        data: dto,
      });

      this.logger.logSuccess('Update category', { id, name: category.name });
      return category;
    } catch (error) {
      this.logger.logFailure('Update category', error as Error);
      throw error;
    }
  }

  async remove(id: string, userId: string) {
    this.logger.logOperation('Delete category', { id, userId });

    await this.findOne(id, userId);

    try {
      await this.prisma.category.update({
        where: { id },
        data: { deletedAt: new Date() },
      });

      this.logger.logSuccess('Delete category', { id });
      return { message: 'Category deleted successfully' };
    } catch (error) {
      this.logger.logFailure('Delete category', error as Error);
      throw error;
    }
  }
}
