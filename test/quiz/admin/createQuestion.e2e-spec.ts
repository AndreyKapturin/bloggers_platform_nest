import { INestApplication } from '@nestjs/common';
import { setupApp } from '../../../src/core/setupApp';
import { cleanDatabase } from '../../utils/cleanDatabase';
import { initApp } from '../../utils/initApp';
import { SA_QuestionsTestHelper } from '../../utils/SA_QuestionsTestHelper';

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
});
