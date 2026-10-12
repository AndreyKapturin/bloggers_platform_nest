import { HttpStatus, INestApplication } from '@nestjs/common';
import { setupApp } from '../../../src/core/setupApp';
import { cleanDatabase } from '../../utils/cleanDatabase';
import { initApp } from '../../utils/initApp';
import { SA_QuestionsTestHelper } from '../../utils/SA_QuestionsTestHelper';

describe('delete question', () => {
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

  it('should delete question if it exists and admin auth passed', async () => {
    await questionsTestHelper.deleteQuestion(questionId);
  });

  it(`shouldn't delete question if not admin auth`, async () => {
    await questionsTestHelper.deleteQuestion(questionId, {
      auth: false,
      status: HttpStatus.UNAUTHORIZED,
    });
  });

  it(`shouldn't delete question if it doesn't exist`, async () => {
    await questionsTestHelper.deleteQuestion(crypto.randomUUID(), {
      status: HttpStatus.NOT_FOUND,
    });
  });
});
