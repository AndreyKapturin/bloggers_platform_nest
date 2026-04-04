import { Injectable } from '@nestjs/common';
import { ViewUserDto } from '../dto/User.view-dto';
import { User } from '../domain/user.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model, QueryFilter } from 'mongoose';
import { UserQueryParamsDto } from '../dto/UserQueryParams.dto';
import { PaginatedView } from 'src/core/dto/PaginatedView.dto';

@Injectable()
export class UsersQueryRepository {
  constructor(@InjectModel(User.name) private UserModel: Model<User>) {}

  async findById(id: string): Promise<ViewUserDto | null> {
    const userDocument = await this.UserModel.findById(id);
    if (!userDocument) return null;
    return ViewUserDto.toView(userDocument);
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

    const filter: QueryFilter<User> = {};

    if (searchLoginTerm || searchEmailTerm) {
      filter.$or = [];
      if (searchLoginTerm) {
        filter.$or.push({ login: { $regex: searchLoginTerm, $options: 'i' } });
      }
      if (searchEmailTerm) {
        filter.$or.push({ email: { $regex: searchEmailTerm, $options: 'i' } });
      }
    }

    const userDocuments = await this.UserModel.find(filter)
      .sort({ [sortBy]: sortDirection })
      .skip(skip)
      .limit(pageSize);

    const totalCount = await this.UserModel.countDocuments(filter);

    const viewUserDocuments = userDocuments.map((ud) => ViewUserDto.toView(ud));
    const paginatedViewUserDocuments = PaginatedView.toView(
      pageNumber,
      pageSize,
      totalCount,
      viewUserDocuments,
    );
    return paginatedViewUserDocuments;
  }
}
