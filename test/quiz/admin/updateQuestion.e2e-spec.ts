import { HttpStatus, INestApplication } from '@nestjs/common';
import { setupApp } from '../../../src/core/setupApp';
import {
  MAX_QUESTION_BODY_LENGTH,
  MIN_QUESTION_BODY_LENGTH,
} from '../../../src/modules/quiz/api/dto/HttpCreateQuestion.dto';
import { HttpUpdateQuestionDto } from '../../../src/modules/quiz/api/dto/HttpUpdateQuestion.dto';
import { cleanDatabase } from '../../utils/cleanDatabase';
import { initApp } from '../../utils/initApp';
import { SA_QuestionsTestHelper } from '../../utils/SA_QuestionsTestHelper';

describe('update question', () => {
  let app: INestApplication;
  let questionsTestHelper: SA_QuestionsTestHelper;
  let questionId: string;

  beforeAll(async () => {
    app = await initApp();
    setupApp(app);
    await app.init();
    await cleanDatabase(app);

    questionsTestHelper = new SA_QuestionsTestHelper(app);
    const question = await questionsTestHelper.createRandomQuestion();
    questionId = question.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('should update question if input data is valid and admin auth is valid', async () => {
    const inputQuestion: HttpUpdateQuestionDto = {
      body: `Updated question ${Date.now()}`,
      correctAnswers: ['updated answer', 'another answer'],
    };

    await questionsTestHelper.updateQuestion(questionId, inputQuestion);

    const response = await questionsTestHelper.getQuestionsWithQuery({
      filter: { bodySearchTerm: inputQuestion.body },
    });

    expect(response.body.totalCount).toBe(1);
    expect(response.body.items[0]).toMatchObject({
      id: questionId,
      body: inputQuestion.body,
      correctAnswers: inputQuestion.correctAnswers,
    });
  });

  it.each([
    ['body is empty', { body: '' }],
    [
      'body is shorter than allowed',
      { body: 'a'.repeat(MIN_QUESTION_BODY_LENGTH - 1) },
    ],
    [
      'body exceeds maximum length',
      { body: 'a'.repeat(MAX_QUESTION_BODY_LENGTH + 1) },
    ],
    [
      'body contains only whitespace',
      { body: ' '.repeat(MIN_QUESTION_BODY_LENGTH) },
    ],
    ['correctAnswers is not an array', { correctAnswers: 'answer' }],
    [
      'correctAnswers contains a non-string value',
      { correctAnswers: ['answer', 123] },
    ],
  ])('should return BAD REQUEST if %s', async (_caseName, invalidFields) => {
    const inputQuestion = {
      ...questionsTestHelper.createInputDto(),
      ...invalidFields,
    };

    await questionsTestHelper.updateQuestion(
      questionId,
      inputQuestion as HttpUpdateQuestionDto,
      { status: HttpStatus.BAD_REQUEST },
    );
  });

  it('should return BAD REQUEST if body field is missing', async () => {
    const inputQuestion = questionsTestHelper.createInputDto();

    await questionsTestHelper.updateQuestion(
      questionId,
      { correctAnswers: inputQuestion.correctAnswers } as HttpUpdateQuestionDto,
      { status: HttpStatus.BAD_REQUEST },
    );
  });

  it('should return BAD REQUEST if correctAnswers field is missing', async () => {
    const inputQuestion = questionsTestHelper.createInputDto();

    await questionsTestHelper.updateQuestion(
      questionId,
      { body: inputQuestion.body } as HttpUpdateQuestionDto,
      { status: HttpStatus.BAD_REQUEST },
    );
  });

  it(`shouldn't update question if not admin auth`, async () => {
    await questionsTestHelper.updateQuestion(
      questionId,
      questionsTestHelper.createInputDto(),
      {
        auth: false,
        status: HttpStatus.UNAUTHORIZED,
      },
    );
  });

  it('should return NOT FOUND if question does not exist', async () => {
    await questionsTestHelper.updateQuestion(
      crypto.randomUUID(),
      questionsTestHelper.createInputDto(),
      { status: HttpStatus.NOT_FOUND },
    );
  });
});
