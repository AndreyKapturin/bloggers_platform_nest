import { HttpStatus, INestApplication } from '@nestjs/common';
import { setupApp } from '../../../src/core/setupApp';
import { cleanDatabase } from '../../utils/cleanDatabase';
import { initApp } from '../../utils/initApp';
import { SA_QuestionsTestHelper } from '../../utils/SA_QuestionsTestHelper';
import { MAX_QUESTION_BODY_LENGTH } from '../../../src/modules/quiz/api/dto/HttpCreateQuestion.dto';

describe('create question', () => {
  let app: INestApplication;
  let questionsTestHelper: SA_QuestionsTestHelper;

  beforeAll(async () => {
    app = await initApp();
    setupApp(app);
    await app.init();
    questionsTestHelper = new SA_QuestionsTestHelper(app);
    await cleanDatabase(app);
  });

  afterAll(async () => {
    await app.close();
  });

  it(`should create question. Return view question. if input data is correct and admin auth`, async () => {
    const inputDto = questionsTestHelper.createInputDto();
    const response = await questionsTestHelper.createQuestion(inputDto);
    const expectedQuestion = questionsTestHelper.createExpectedQuestion({
      body: inputDto.body,
      correctAnswers: inputDto.correctAnswers,
    });

    expect(response.body).toEqual(expectedQuestion);
  });

  it.each([
    ['body is empty', { body: '' }],
    ['body is shorter than allowed', { body: 'short' }],
    [
      'body is longer than allowed',
      { body: 'a'.repeat(MAX_QUESTION_BODY_LENGTH + 1) },
    ],
    ['body is not a string', { body: 123 }],
    ['correctAnswers is not an array', { correctAnswers: 'answer' }],
    [
      'correctAnswers contains a non-string value',
      { correctAnswers: ['answer', 123] },
    ],
    ['correctAnswers is null', { correctAnswers: null }],
  ])('should return BAD REQUEST if %s', async (_caseName, invalidFields) => {
    const inputDto = questionsTestHelper.createInputDto();
    Object.assign(inputDto, invalidFields);

    await questionsTestHelper.createQuestion(inputDto, {
      status: HttpStatus.BAD_REQUEST,
    });
  });

  it(`should return UNAUTHORIZED if input data is correct but no auth`, async () => {
    const inputDto = questionsTestHelper.createInputDto();
    await questionsTestHelper.createQuestion(inputDto, {
      auth: false,
      status: HttpStatus.UNAUTHORIZED,
    });
  });
});
