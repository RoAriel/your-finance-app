import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException, // 👈 Necesario para validar el padre
} from '@nestjs/common';
import { Category } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { QueryCategoryDto } from './dto/query-category.dto';
import { AppLogger } from '../common/utils/logger.util';
import {
  PaginatedResult,
  createPaginatedResponse,
} from '../common/dto/pagination.dto';
import { DEFAULT_CATEGORIES_HIERARCHY } from '../common/constants/default-categories';

@Injectable()
export class CategoriesService {
  private readonly logger = new AppLogger(CategoriesService.name);

  constructor(private prisma: PrismaService) {}

  // -----------------------------------------------------------------------
  // 1. SEED JERÁRQUICO (FUSIONADO)
  // -----------------------------------------------------------------------
  async seed(userId: string) {
    this.logger.log(`Seeding default categories for user: ${userId}`);

    // 1. Verificación rápida
    const existingCount = await this.prisma.category.count({
      where: { userId, deletedAt: null },
    });

    if (existingCount > 0) {
      return { message: 'User already has categories', count: existingCount };
    }

    try {
      // 2. Transacción única para todo el árbol
      await this.prisma.$transaction(async (tx) => {
        // Iteramos sobre la constante maestra
        for (const catData of DEFAULT_CATEGORIES_HIERARCHY) {
          // A. Crear Padre
          const parent = await tx.category.create({
            data: {
              name: catData.name,
              type: catData.type, // Ya es compatible gracias al paso 1
              color: catData.color,
              icon: catData.icon,
              isFixed: catData.isFixed,
              userId,
            },
          });

          // B. Crear Hijos (si existen)
          if (catData.children && catData.children.length > 0) {
            const childrenData = catData.children.map((child) => ({
              name: child.name,
              type: child.type,
              color: child.color, // Heredan color del padre o tienen propio
              icon: child.icon,
              isFixed: child.isFixed,
              parentId: parent.id, // Vinculamos al padre recién creado
              userId,
            }));

            await tx.category.createMany({
              data: childrenData,
            });
          }
        }
      });

      this.logger.logSuccess('Seed categories completed', { userId });

      // Retornar resumen en lugar de todos los objetos (más ligero)
      return { success: true, message: 'Categories seeded successfully' };
    } catch (error) {
      this.logger.logFailure('Seed categories', error as Error);
      throw error;
    }
  }

  // -----------------------------------------------------------------------
  // 2. CREATE CON VALIDACIÓN DE PADRE
  // -----------------------------------------------------------------------
  async create(dto: CreateCategoryDto, userId: string) {
    this.logger.logOperation('Create category', {
      name: dto.name,
      type: dto.type,
      userId,
      parentId: dto.parentId, // Logueamos si tiene padre
    });

    // 1. Validar nombre duplicado (Existente)
    const existing = await this.prisma.category.findFirst({
      where: {
        name: dto.name,
        type: dto.type,
        userId,
        deletedAt: null,
      },
    });

    if (existing) {
      this.logger.warn(`Duplicate category: ${dto.name}`);
      throw new ConflictException(`Category "${dto.name}" already exists`);
    }

    // 2. Validar Padre (NUEVO)
    if (dto.parentId) {
      const parent = await this.prisma.category.findUnique({
        where: { id: dto.parentId },
      });

      if (!parent) {
        throw new NotFoundException('Parent category not found');
      }

      // Seguridad: El padre debe ser mío
      if (parent.userId !== userId) {
        throw new BadRequestException(
          'Parent category does not belong to user',
        );
      }

      // Coherencia: El padre no puede ser una subcategoría (solo permitimos 2 niveles por ahora para no complicar la UI)
      if (parent.parentId) {
        throw new BadRequestException(
          'Nesting limit reached. Cannot create a subcategory of a subcategory.',
        );
      }
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

  // -----------------------------------------------------------------------
  // 3. FIND ALL (LISTAR)
  // -----------------------------------------------------------------------
  async findAll(
    query: QueryCategoryDto,
    userId: string,
  ): Promise<PaginatedResult<Category>> {
    this.logger.log(
      `Finding categories for user ${userId} with filters: ${JSON.stringify(query)}`,
    );

    const { page = 1, limit = 20, type } = query;

    const where: Prisma.CategoryWhereInput = {
      userId,
      deletedAt: null,
    };

    if (type && (type as string) === 'both') {
      where.OR = [{ type: 'INCOME' }, { type: 'EXPENSE' }, { type: 'BOTH' }];
    } else if (type) {
      where.type = type;
    }

    const skip = (page - 1) * limit;

    // Nota: findAll devuelve la lista plana. El Frontend usará 'parentId' para anidar visualmente.
    const [data, total] = await Promise.all([
      this.prisma.category.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
        // include: { children: true } // Descomentar si el front prefiere recibirlo ya anidado
      }),
      this.prisma.category.count({ where }),
    ]);

    this.logger.log(`Found ${data.length} of ${total} categories`);

    return createPaginatedResponse(data, total, page, limit);
  }

  async findOne(id: string, userId: string) {
    this.logger.log(`Finding category ${id}`);

    const category = await this.prisma.category.findFirst({
      where: {
        id,
        userId,
        deletedAt: null,
      },
      include: { children: true, parent: true }, // Aquí sí traemos relaciones por si acaso
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return category;
  }

  // -----------------------------------------------------------------------
  // 4. UPDATE
  // -----------------------------------------------------------------------
  async update(id: string, dto: UpdateCategoryDto, userId: string) {
    this.logger.logOperation('Update category', { id, updates: dto, userId });

    await this.findOne(id, userId);

    // Validar nombre duplicado si cambia
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

    // Validar nuevo Padre si cambia
    if (dto.parentId) {
      // Chequeo de seguridad básico
      const parent = await this.prisma.category.findUnique({
        where: { id: dto.parentId },
      });
      if (!parent || parent.userId !== userId)
        throw new BadRequestException('Invalid parent category');
      if (dto.parentId === id)
        throw new BadRequestException('Category cannot be its own parent');
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

    await this.findOne(id, userId); // Verifica existencia y propiedad

    // Usamos transacción para que si falla el borrado del padre,
    // no queden hijos "huerfanos" borrados a medias.
    return this.prisma.$transaction(async (tx) => {
      // 1. Soft Delete de hijos
      const deletedChildren = await tx.category.updateMany({
        where: { parentId: id },
        data: { deletedAt: new Date() },
      });

      // 2. Soft Delete del padre
      await tx.category.update({
        where: { id },
        data: { deletedAt: new Date() },
      });

      return {
        message: 'Category deleted successfully',
        childrenDeleted: deletedChildren.count,
      };
    });
  }
}
