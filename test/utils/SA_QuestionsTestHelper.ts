import { INestApplication, HttpStatus } from '@nestjs/common';
import request from 'supertest';
import { ADMIN_LOGIN, ADMIN_PASSWORD } from '../../src/core/constants';
import { ResponseWithBody } from './generics';
import { HttpCreateQuestionDto } from '../../src/modules/quiz/api/dto/HttpCreateQuestion.dto';
import { QuestionDtoFabrics } from './QuestionDtoFabrics';
import { ViewQuestionDto } from '../../src/modules/quiz/api/dto/ViewQuestion.view-dto';

export class SA_QuestionsTestHelper {
  private BASE_URL = '/sa/quiz/questions';

  constructor(private app: INestApplication) {}

  createInputDto(): HttpCreateQuestionDto {
    return QuestionDtoFabrics.createInputDto();
  }

  createExpectedQuestion(
    overrideFields: Partial<ViewQuestionDto> = {},
  ): ViewQuestionDto {
    return QuestionDtoFabrics.createExpectedQuestion(overrideFields);
  }

  async createQuestion(
    dto: HttpCreateQuestionDto,
    options?: { status?: HttpStatus; auth?: boolean },
  ): Promise<ResponseWithBody<ViewQuestionDto>> {
    const innerOptions = {
      status: HttpStatus.CREATED,
      auth: true,
      ...options,
    };

    const createQuestionRequest = request(this.app.getHttpServer())
      .post(this.BASE_URL)
      .send(dto)
      .expect(innerOptions.status);

    if (innerOptions.auth) {
      createQuestionRequest.auth(ADMIN_LOGIN, ADMIN_PASSWORD, {
        type: 'basic',
      });
    }

    return createQuestionRequest;
  }
}
