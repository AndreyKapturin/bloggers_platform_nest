import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ViewUserDto } from './dto/ViewUser.dto';
import { UserQueryParamsDto } from './dto/UserQueryParams.dto';
import { PaginatedView } from '../../../../core/dto/PaginatedView.dto';
import { HttpCreateUserDto } from './dto/HttpCreateUser.dto';
import { BasicAuthGuard } from '../../auth/strategies/basic/Basic.guard';
import { CreateUserCommand } from '../application/useCases/create-user.use-case';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { GetUserQuery } from '../application/queries/get-user.query';
import { GetUsersQuery } from '../application/queries/get-users.query';
import { DeleteUserCommand } from '../application/useCases/delete-user.use-case';

@Controller('users')
@UseGuards(BasicAuthGuard)
export class UsersController {
  constructor(
    private commandBus: CommandBus,
    private queryBus: QueryBus,
  ) {}

  @Get()
  async getAll(
    @Query() queryParams: UserQueryParamsDto,
  ): Promise<PaginatedView<ViewUserDto>> {
    return this.queryBus.execute(new GetUsersQuery(queryParams));
  }

  @Post()
  async createUser(@Body() dto: HttpCreateUserDto): Promise<ViewUserDto> {
    const command = new CreateUserCommand(dto.login, dto.email, dto.password);
    const userId = await this.commandBus.execute(command);
    return this.queryBus.execute(new GetUserQuery(userId));
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(@Param('id') id: string): Promise<void> {
    await this.commandBus.execute(new DeleteUserCommand(id));
  }
}
