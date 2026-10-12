import { Body, Controller, Post } from "@nestjs/common";
import { HttpCreateQuestionDto } from "./dto/HttpCreateQuestion.dto";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { CreateQuestionCommand } from "../application/useCases/create-question.use-case";
import { GetQuestionQuery } from "../application/queries/get-question.query";

@Controller('/sa/quiz/questions')
export class SA_QuizQuestionsController {
  constructor(
    private commandBus: CommandBus,
    private queryBus: QueryBus,
  ) {}

  @Post()
  async createQuestion(@Body() createQuestionDto: HttpCreateQuestionDto) {
    const command = new CreateQuestionCommand(
      createQuestionDto.body,
      createQuestionDto.correctAnswers,
    );
    const questionId = await this.commandBus.execute(command);
    const question = await this.queryBus.execute(new GetQuestionQuery(questionId));
    return question;
  }
}
