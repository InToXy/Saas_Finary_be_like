import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AccountsService } from './accounts.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('accounts')
@Controller('accounts')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AccountsController {
  constructor(private accountsService: AccountsService) {}

  @Get()
  async findAll(@CurrentUser('id') userId: string) {
    return this.accountsService.findAll(userId);
  }

  @Post()
  async create(@CurrentUser('id') userId: string, @Body() data: any) {
    return this.accountsService.create(userId, data);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @CurrentUser('id') userId: string, @Body() data: any) {
    return this.accountsService.update(id, userId, data);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.accountsService.delete(id, userId);
  }
}
