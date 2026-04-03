import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ViewUserDto } from '../dto/User.view-dto';
import { InputCreateUserDto } from '../dto/User.input-create-dto';
import { UsersQueryRepository } from '../infrastructure/users.query-repository';
import { UsersService } from '../application/users.service';
import { UserQueryParamsDto } from '../dto/UserQueryParams.dto';
import { PaginatedView } from 'src/core/dto/PaginatedView.dto';

@Controller('users')
export class UsersController {
  constructor(
    private usersQueryRepository: UsersQueryRepository,
    private usersService: UsersService,
  ) {}

  @Get()
  async getAll(
    @Query() query: UserQueryParamsDto,
  ): Promise<PaginatedView<ViewUserDto>> {
    return this.usersQueryRepository.find(query);
  }

  @Post()
  async createUser(
    @Body() createUserDto: InputCreateUserDto,
  ): Promise<ViewUserDto> {
    const userId = await this.usersService.createUser(createUserDto);
    const viewUser = await this.usersQueryRepository.findById(userId);
    return viewUser!;
  }

  @Delete(':id')
  @HttpCode(204)
  async deleteUser(@Param('id') id: string): Promise<void> {
    await this.usersService.deleteUser(id);
  }
}
