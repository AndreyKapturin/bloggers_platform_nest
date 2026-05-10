import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import { HttpCommentDto } from './dto/HttpComment.dto';
import { ExtractUserFromRequest } from '../../../../core/decorators/extract-userId.decorator';
import { UserInRequestDto } from '../../../../core/dto/UserInRequest.dto';
import { UpdateCommentCommand } from '../application/useCases/update-comment.use-case';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { JwtAuthGuard } from '../../../user-accounts/auth/strategies/jwt/Jwt.guard';
import { DeleteCommentCommand } from '../application/useCases/delete-comment.use-case';
import { HttpLikeStatusDto } from '../../dto/HttpLikeStatus.dto';
import { LikeCommentCommand } from '../application/useCases/like-comment.use-case';
import { JwtOptionalAuthGuard } from '../../../user-accounts/auth/strategies/jwt/JwtOptional.guard';
import { GetCommentQuery } from '../application/queries/get-comment-by-id.query';
import { OptionalUserFromRequest } from '../../../../core/decorators/optional-user-in-request.decorator';

@Controller('comments')
export class CommentsController {
  constructor(
    private commandBus: CommandBus,
    private queryBus: QueryBus,
  ) {}

  @Get(':id')
  @UseGuards(JwtOptionalAuthGuard)
  async getById(
    @Param('id') id: string,
    @OptionalUserFromRequest() dto: UserInRequestDto | null,
  ) {
    const query = new GetCommentQuery(id, dto?.userId ?? null);
    return this.queryBus.execute(query);
  }

  @Put(':commentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  async updateComment(
    @Param('commentId') commentId: string,
    @Body() commentDto: HttpCommentDto,
    @ExtractUserFromRequest() userDto: UserInRequestDto,
  ) {
    const command = new UpdateCommentCommand(
      commentId,
      commentDto.content,
      userDto.userId,
    );
    await this.commandBus.execute(command);
  }

  @Put(':commentId/like-status')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  async changeLikeStatus(
    @Param('commentId') commentId: string,
    @Body() likeDto: HttpLikeStatusDto,
    @ExtractUserFromRequest() userDto: UserInRequestDto,
  ) {
    const command = new LikeCommentCommand(
      commentId,
      likeDto.likeStatus,
      userDto.userId,
    );
    await this.commandBus.execute(command);
  }

  @Delete(':commentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  async deleteComment(
    @Param('commentId') commentId: string,
    @ExtractUserFromRequest() dto: UserInRequestDto,
  ) {
    const command = new DeleteCommentCommand(commentId, dto.userId);
    await this.commandBus.execute(command);
  }
}
