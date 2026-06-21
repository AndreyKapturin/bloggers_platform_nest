import { Injectable } from '@nestjs/common';
import { ViewUserDto } from '../api/dto/ViewUser.dto';
import { TUserModel } from '../domain/user.entity';
import { UserQueryParamsDto } from '../api/dto/UserQueryParams.dto';
import { PaginatedView } from '../../../../core/dto/PaginatedView.dto';
import { ViewMeDto } from '../api/dto/ViewMe.dto';
import {
  DomainException,
  DomainExceptionStatus,
} from '../../../../core/exceptions/DomainException';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class UsersQueryRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async findById(id: string): Promise<ViewUserDto | null> {
    const rows = await this.dataSource.query<TUserModel[]>(
      `SELECT * FROM "users" WHERE "id" = $1 LIMIT 1;`,
      [id],
    );
    if (!rows[0]) return null;

    return ViewUserDto.toView(rows[0]);
  }

  async findByIdOrThrow(id: string): Promise<ViewUserDto> {
    const foundUser = await this.findById(id);

    if (!foundUser) {
      throw new DomainException(
        DomainExceptionStatus.NotFound,
        `User with id ${id} not found`,
        [
          {
            field: 'userId',
            message: `User with id ${id} not found`,
          },
        ],
      );
    }

    return foundUser;
  }

  async find(
    usersQueryDto: UserQueryParamsDto,
  ): Promise<PaginatedView<ViewUserDto>> {
    const {
      pageNumber,
      pageSize,
      skip,
      sortBy,
      sortDirection,
      searchEmailTerm,
      searchLoginTerm,
    } = usersQueryDto;

    const whereParams: (string | number)[] = [];
    const conditions: string[] = [];

    const fromPart = `FROM "users"`;
    let wherePart = '';

    if (searchLoginTerm) {
      whereParams.push(`%${searchLoginTerm}%`);
      conditions.push(`"login" ILIKE $${whereParams.length}`);
    }

    if (searchEmailTerm) {
      whereParams.push(`%${searchEmailTerm}%`);
      conditions.push(`"email" ILIKE $${whereParams.length}`);
    }

    if (conditions.length > 0) {
      wherePart += 'WHERE ' + conditions.join(' OR ');
    }

    const params = [...whereParams];
    
    const orderPath = `ORDER BY "${sortBy}" ${sortDirection}`;

    params.push(pageSize);
    const limitPart = `LIMIT $${params.length}`;

    params.push(skip);
    const offsetPart = `OFFSET $${params.length}`;

    const getUsersSql = `
      SELECT
        "id",
        "login",
        "email",
        "createdAt",
        "isConfirmed"
      ${fromPart}
      ${wherePart}
      ${orderPath}
      ${limitPart}
      ${offsetPart}`;

    const rows = await this.dataSource.query<TUserModel[]>(getUsersSql, params);

    const getTotalCountSql = `
      SELECT
        COUNT(*)::integer as "totalCount"
      ${fromPart}
      ${wherePart};`;

    const [{ totalCount }] = await this.dataSource.query<
      { totalCount: number }[]
    >(getTotalCountSql, whereParams);

    const viewUserDocuments = rows.map((user) => ViewUserDto.toView(user));
    const paginatedViewUserDocuments = PaginatedView.toView(
      pageNumber,
      pageSize,
      totalCount,
      viewUserDocuments,
    );
    return paginatedViewUserDocuments;
  }

  async getMe(id: string): Promise<ViewMeDto> {
    const rows = await this.dataSource.query<TUserModel[]>(
      `SELECT * FROM "users" WHERE "id" = $1 LIMIT 1;`,
      [id],
    );
    if (!rows[0]) throw new Error('User not found. Check JwtAuthGuard!');
    return ViewMeDto.toView(rows[0]);
  }
}
