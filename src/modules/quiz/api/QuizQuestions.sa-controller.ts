import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { HttpCreateQuestionDto } from './dto/HttpCreateQuestion.dto';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateQuestionCommand } from '../application/useCases/create-question.use-case';
import { GetQuestionQuery } from '../application/queries/get-question.query';
import { DeleteQuestionCommand } from '../application/useCases/delete-question.use-case';
import { BasicAuthGuard } from '../../user-accounts/auth/strategies/basic/Basic.guard';
import { QuestionsQueryParamsDto } from './dto/QuestionsQueryParams.dto';
import { PaginatedView } from '../../../core/dto/PaginatedView.dto';
import { ViewQuestionDto } from './dto/ViewQuestion.view-dto';
import { GetQuestionsQuery } from '../application/queries/get-questions.query';
import { HttpUpdateQuestionDto } from './dto/HttpUpdateQuestion.dto';
import { UpdateQuestionCommand } from '../application/useCases/update-question.use-case';

@UseGuards(BasicAuthGuard)
@Controller('/sa/quiz/questions')
export class SA_QuizQuestionsController {
  constructor(
    private commandBus: CommandBus,
    private queryBus: QueryBus,
  ) {}

  @Get()
  async getQuestions(
    @Query() queryParams: QuestionsQueryParamsDto,
  ): Promise<PaginatedView<ViewQuestionDto>> {
    return this.queryBus.execute(new GetQuestionsQuery(queryParams));
  }

  @Post()
  async createQuestion(@Body() createQuestionDto: HttpCreateQuestionDto) {
    const command = new CreateQuestionCommand(
      createQuestionDto.body,
      createQuestionDto.correctAnswers,
    );
    const questionId = await this.commandBus.execute(command);
    const question = await this.queryBus.execute(
      new GetQuestionQuery(questionId),
    );
    return question;
  }

  @Put(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateQuestion(
    @Param('id') id: string,
    @Body() dto: HttpUpdateQuestionDto,
  ) {
    const command = new UpdateQuestionCommand(id, dto.body, dto.correctAnswers);
    await this.commandBus.execute(command);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteQuestion(@Param('id') id: string): Promise<void> {
    await this.commandBus.execute(new DeleteQuestionCommand(id));
  }
}
