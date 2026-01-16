// src/categories/categories.service.ts

import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { QueryCategoryDto } from './dto/query-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  // Método seed corregido
  async seed(userId: string) {
    // Verificar si ya existen categorías para este usuario
    const existingCategories = await this.prisma.category.findMany({
      where: { userId, deletedAt: null },
    });

    if (existingCategories.length > 0) {
      // Ya tiene categorías, retornar las existentes con mensaje
      return {
        message: 'Categories already exist',
        categories: existingCategories,
      };
    }

    // Categorías default para crear
    const defaultCategories = [
      // GASTOS
      {
        name: 'Supermercado',
        type: 'expense',
        color: '#FF6B6B',
        icon: 'shopping-cart',
      },
      { name: 'Transporte', type: 'expense', color: '#4ECDC4', icon: 'car' },
      { name: 'Salud', type: 'expense', color: '#95E1D3', icon: 'heart' },
      {
        name: 'Entretenimiento',
        type: 'expense',
        color: '#F38181',
        icon: 'film',
      },
      { name: 'Servicios', type: 'expense', color: '#AA96DA', icon: 'zap' },
      {
        name: 'Restaurantes',
        type: 'expense',
        color: '#FCBAD3',
        icon: 'coffee',
      },
      { name: 'Educación', type: 'expense', color: '#A8D8EA', icon: 'book' },
      { name: 'Ropa', type: 'expense', color: '#FFD93D', icon: 'shopping-bag' },

      // INGRESOS
      { name: 'Salario', type: 'income', color: '#6BCF7F', icon: 'briefcase' },
      { name: 'Freelance', type: 'income', color: '#4D96FF', icon: 'code' },
      {
        name: 'Inversiones',
        type: 'income',
        color: '#FFB830',
        icon: 'trending-up',
      },
      { name: 'Bonos', type: 'income', color: '#C780FA', icon: 'gift' },

      // AMBOS
      {
        name: 'Otros',
        type: 'both',
        color: '#95A5A6',
        icon: 'more-horizontal',
      },
    ];

    // Crear todas las categorías
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

    // Retornar objeto con message y categories
    return {
      message: 'Default categories created successfully',
      categories: createdCategories,
    };
  }

  // CRUD methods...

  async create(dto: CreateCategoryDto, userId: string) {
    // Verificar si ya existe una categoría con ese nombre y tipo
    const existing = await this.prisma.category.findFirst({
      where: {
        name: dto.name,
        type: dto.type,
        userId,
        deletedAt: null,
      },
    });

    if (existing) {
      throw new ConflictException(
        `Category "${dto.name}" with type "${dto.type}" already exists`,
      );
    }

    return this.prisma.category.create({
      data: {
        ...dto,
        userId,
      },
    });
  }

  async findAll(query: QueryCategoryDto, userId: string) {
    const where: any = {
      userId,
      deletedAt: null,
    };

    // Filtrar por tipo si se especifica
    if (query.type && query.type !== 'both') {
      where.OR = [{ type: query.type }, { type: 'both' }];
    }

    return this.prisma.category.findMany({
      where,
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string, userId: string) {
    const category = await this.prisma.category.findFirst({
      where: {
        id,
        userId,
        deletedAt: null,
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  async update(id: string, dto: UpdateCategoryDto, userId: string) {
    // Verificar que existe y pertenece al usuario
    await this.findOne(id, userId);

    // Si está actualizando el nombre, verificar que no exista otro con ese nombre
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
        throw new ConflictException(`Category "${dto.name}" already exists`);
      }
    }

    return this.prisma.category.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string, userId: string) {
    // Verificar que existe y pertenece al usuario
    await this.findOne(id, userId);

    // Soft delete
    await this.prisma.category.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return { message: 'Category deleted successfully' };
  }
}
