// src/categories/categories.controller.ts

import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { QueryCategoryDto } from './dto/query-category.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { PaginatedResult } from '../common/dto/pagination.dto';
import { Category } from '@prisma/client';

@Controller('categories')
@UseGuards(JwtAuthGuard)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  /**
   * Crea las categorías por defecto para el usuario
   * @returns Mensaje y array de categorías creadas
   */
  @Post('seed')
  async seed(@CurrentUser('id') userId: string) {
    return this.categoriesService.seed(userId);
  }

  /**
   * Crea una nueva categoría personalizada
   * @param createCategoryDto - Datos de la categoría
   * @param userId - ID del usuario autenticado
   * @returns Categoría creada
   */
  @Post()
  async create(
    @Body() createCategoryDto: CreateCategoryDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.categoriesService.create(createCategoryDto, userId);
  }

  /**
   * Lista todas las categorías del usuario con filtros opcionales
   * @param query - Filtros de búsqueda (type)
   * @param userId - ID del usuario autenticado
   * @returns Array de categorías
   */
  @Get()
  async findAll(
    @Query() query: QueryCategoryDto,
    @CurrentUser('id') userId: string,
  ): Promise<PaginatedResult<Category>> {
    return this.categoriesService.findAll(query, userId);
  }

  /**
   * Obtiene una categoría específica por ID
   * @param id - ID de la categoría
   * @param userId - ID del usuario autenticado
   * @returns Categoría encontrada
   */
  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.categoriesService.findOne(id, userId);
  }

  /**
   * Actualiza una categoría existente
   * @param id - ID de la categoría
   * @param updateCategoryDto - Datos a actualizar
   * @param userId - ID del usuario autenticado
   * @returns Categoría actualizada
   */
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
    @CurrentUser('id') userId: string,
  ) {
    return this.categoriesService.update(id, updateCategoryDto, userId);
  }

  /**
   * Elimina una categoría (soft delete)
   * @param id - ID de la categoría
   * @param userId - ID del usuario autenticado
   * @returns Mensaje de confirmación
   */
  @Delete(':id')
  async remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.categoriesService.remove(id, userId);
  }
}
