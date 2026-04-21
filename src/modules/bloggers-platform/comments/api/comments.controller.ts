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
import { ExtractUserFromRequest } from '../../../user-accounts/auth/decorators/extract-userId.decorator';
import { UserInRequest } from '../../../user-accounts/auth/dto/UserInRequest.dto';
import { UpdateCommentCommand } from '../application/useCases/update-comment.use-case';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { JwtAuthGuard } from '../../../user-accounts/auth/strategies/jwt/Jwt.guard';
import { DeleteCommentCommand } from '../application/useCases/delete-comment.use-case';
import { HttpLikeStatusDto } from '../../dto/HttpLikeStatus.dto';
import { LikeCommentCommand } from '../application/useCases/like-comment.use-case';
import { JwtOptionalAuthGuard } from '../../../user-accounts/auth/strategies/jwt/JwtOptional.guard';
import { GetCommentQuery } from '../application/queries/get-comment-by-id.query';
import { OptionalUserFromRequest } from '../../../user-accounts/auth/decorators/optional-user-in-request.decorator';

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
    @OptionalUserFromRequest() user: UserInRequest | null,
  ) {
    const query = new GetCommentQuery(id, user?.id ?? null);
    return this.queryBus.execute(query);
  }

  @Put(':commentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  async updateComment(
    @Param('commentId') commentId: string,
    @Body() dto: HttpCommentDto,
    @ExtractUserFromRequest() user: UserInRequest,
  ) {
    const command = new UpdateCommentCommand(commentId, dto.content, user.id);
    await this.commandBus.execute(command);
  }

  @Put(':commentId/like-status')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  async changeLikeStatus(
    @Param('commentId') commentId: string,
    @Body() dto: HttpLikeStatusDto,
    @ExtractUserFromRequest() user: UserInRequest,
  ) {
    const command = new LikeCommentCommand(commentId, dto.likeStatus, user.id);
    await this.commandBus.execute(command);
  }

  @Delete(':commentId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  async deleteComment(
    @Param('commentId') commentId: string,
    @ExtractUserFromRequest() user: UserInRequest,
  ) {
    const command = new DeleteCommentCommand(commentId, user.id);
    await this.commandBus.execute(command);
  }
}
