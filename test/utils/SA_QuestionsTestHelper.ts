import { INestApplication, HttpStatus } from '@nestjs/common';
import request from 'supertest';
import { ADMIN_LOGIN, ADMIN_PASSWORD } from '../../src/core/constants';
import { ResponseWithBody } from './generics';
import { HttpCreateQuestionDto } from '../../src/modules/quiz/api/dto/HttpCreateQuestion.dto';
import { QuestionDtoFabrics } from './QuestionDtoFabrics';
import { ViewQuestionDto } from '../../src/modules/quiz/api/dto/ViewQuestion.view-dto';
import { PaginatedView } from '../../src/core/dto/PaginatedView.dto';
import { QuestionsQueryParamsDto } from '../../src/modules/quiz/api/dto/QuestionsQueryParams.dto';
import { HttpUpdateQuestionDto } from '../../src/modules/quiz/api/dto/HttpUpdateQuestion.dto';

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

  async getQuestionsWithQuery(options?: {
    status?: HttpStatus;
    auth?: boolean;
    filter?: Partial<QuestionsQueryParamsDto>;
  }): Promise<ResponseWithBody<PaginatedView<ViewQuestionDto>>> {
    const innerOptions = {
      status: HttpStatus.OK,
      auth: true,
      ...options,
    };

    const getQuestionsRequest = request(this.app.getHttpServer()).get(
      this.BASE_URL,
    );

    if (innerOptions.filter) {
      getQuestionsRequest.query(innerOptions.filter);
    }

    if (innerOptions.auth) {
      getQuestionsRequest.auth(ADMIN_LOGIN, ADMIN_PASSWORD, { type: 'basic' });
    }

    return getQuestionsRequest.expect(innerOptions.status);
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

  async deleteQuestion(
    id: string,
    options?: { status?: HttpStatus; auth?: boolean },
  ) {
    const innerOptions = {
      status: HttpStatus.NO_CONTENT,
      auth: true,
      ...options,
    };

    const deleteQuestionRequest = request(this.app.getHttpServer())
      .delete(`${this.BASE_URL}/${id}`)
      .expect(innerOptions.status);

    if (innerOptions.auth) {
      deleteQuestionRequest.auth(ADMIN_LOGIN, ADMIN_PASSWORD, {
        type: 'basic',
      });
    }

    return deleteQuestionRequest;
  }

  async updateQuestion(
    id: string,
    dto: HttpUpdateQuestionDto,
    options?: { status?: HttpStatus; auth?: boolean },
  ) {
    const innerOptions = {
      status: HttpStatus.NO_CONTENT,
      auth: true,
      ...options,
    };

    const updateQuestionRequest = request(this.app.getHttpServer())
      .put(`${this.BASE_URL}/${id}`)
      .send(dto)
      .expect(innerOptions.status);

    if (innerOptions.auth) {
      updateQuestionRequest.auth(ADMIN_LOGIN, ADMIN_PASSWORD, {
        type: 'basic',
      });
    }

    return updateQuestionRequest;
  }

  async createRandomQuestion(): Promise<ViewQuestionDto> {
    const dto = this.createInputDto();
    const createQuestionResponse = await this.createQuestion(dto);
    return createQuestionResponse.body;
  }

  async createRandomQuestions(count: number): Promise<ViewQuestionDto[]> {
    const questions = new Array<ViewQuestionDto>(count);

    for (let i = 0; i < count; i++) {
      questions[i] = await this.createRandomQuestion();
    }

    return questions;
  }
}
