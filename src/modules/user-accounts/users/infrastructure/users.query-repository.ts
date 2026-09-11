import { Injectable } from '@nestjs/common';
import { ViewUserDto } from '../api/dto/ViewUser.dto';
import { User } from '../domain/user.entity';
import { UserQueryParamsDto } from '../api/dto/UserQueryParams.dto';
import { PaginatedView } from '../../../../core/dto/PaginatedView.dto';
import { ViewMeDto } from '../api/dto/ViewMe.dto';
import {
  DomainException,
  DomainExceptionStatus,
} from '../../../../core/exceptions/DomainException';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';

@Injectable()
export class UsersQueryRepository {
  constructor(
    @InjectRepository(User)
    private readonly userEntityRepo: Repository<User>,
  ) {}

  async findById(id: string): Promise<ViewUserDto | null> {
    const user = await this.userEntityRepo.findOne({ where: { id } });
    if (!user) return null;
    return ViewUserDto.toView(user);
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

    const [users, totalCount] = await this.userEntityRepo.findAndCount({
      where: [
        { email: searchEmailTerm ? ILike(`%${searchEmailTerm}%`) : undefined },
        { login: searchLoginTerm ? ILike(`%${searchLoginTerm}%`) : undefined },
      ],
      order: { [sortBy]: sortDirection },
      take: pageSize,
      skip,
    });

    const viewUserDocuments = users.map((user) => ViewUserDto.toView(user));
    const paginatedViewUserDocuments = PaginatedView.toView(
      pageNumber,
      pageSize,
      totalCount,
      viewUserDocuments,
    );
    return paginatedViewUserDocuments;
  }

  async getMe(id: string): Promise<ViewMeDto> {
    const user = await this.userEntityRepo.findOneBy({ id });
    if (!user) throw new Error('User not found. Check JwtAuthGuard!');
    return ViewMeDto.toView(user);
  }
}
