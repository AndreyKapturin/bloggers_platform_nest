import { HttpStatus, INestApplication } from '@nestjs/common';
import { setupApp } from '../../../src/core/setupApp';
import { cleanDatabase } from '../../utils/cleanDatabase';
import { initApp } from '../../utils/initApp';
import { SA_QuestionsTestHelper } from '../../utils/SA_QuestionsTestHelper';
import { HttpPublishQuestionDto } from '../../../src/modules/quiz/api/dto/HttpPublishQuestion.dto';

describe('publish question', () => {
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

  it.each([
    ['published is empty', { published: '' }],
    ['published is false', { published: false }],
  ])('should return BAD REQUEST if %s', async (_caseName, dto) => {
    await questionsTestHelper.publishQuestion(
      questionId,
      dto as unknown as HttpPublishQuestionDto,
      {
        status: HttpStatus.BAD_REQUEST,
      },
    );
  });

  it('should publish question if it exists and admin auth passed', async () => {
    await questionsTestHelper.publishQuestion(questionId, { published: true });
  });

  it(`shouldn't publish question if not admin auth`, async () => {
    await questionsTestHelper.publishQuestion(
      questionId,
      { published: true },
      {
        auth: false,
        status: HttpStatus.UNAUTHORIZED,
      },
    );
  });

  it(`shouldn't publish question if it doesn't exist`, async () => {
    await questionsTestHelper.publishQuestion(
      crypto.randomUUID(),
      { published: true },
      {
        status: HttpStatus.NOT_FOUND,
      },
    );
  });
});
