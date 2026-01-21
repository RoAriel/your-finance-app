import { PartialType } from '@nestjs/swagger';
import { CreateSavingsAccountDto } from './create-saving.dto';

export class UpdateSavingDto extends PartialType(CreateSavingsAccountDto) {}
