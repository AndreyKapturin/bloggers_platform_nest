import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CommentsQueryRepository } from '../infrastructure/Comments.query-repository';
import { HttpCommentDto } from './dto/HttpComment.dto';
import { ExtractUserFromRequest } from '../../../user-accounts/auth/decorators/extract-userId.decorator';
import { UserInRequest } from '../../../user-accounts/auth/dto/UserInRequest.dto';
import { UpdateCommentCommand } from '../application/useCases/update-comment.use-case';
import { CommandBus } from '@nestjs/cqrs';
import { JwtAuthGuard } from '../../../user-accounts/auth/strategies/jwt/Jwt.guard';

@Controller('comments')
export class CommentsController {
  constructor(
    private commentsQueryRepository: CommentsQueryRepository,
    private commandBus: CommandBus,
  ) {}

  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.commentsQueryRepository.findById(id);
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
}
