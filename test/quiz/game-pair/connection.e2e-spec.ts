import { HttpStatus, INestApplication } from '@nestjs/common';
import { setupApp } from '../../../src/core/setupApp';
import { cleanDatabase } from '../../utils/cleanDatabase';
import { initApp } from '../../utils/initApp';
import { SA_QuestionsTestHelper } from '../../utils/SA_QuestionsTestHelper';
import { MAX_QUESTION_BODY_LENGTH } from '../../../src/modules/quiz/api/dto/HttpCreateQuestion.dto';
import { UsersTestHelper } from '../../utils/UsersTestHelper';
import request from 'supertest';
import { AuthTestHelper } from '../../utils/AuthTestHelper';
import { MockThrottlerToggle } from '../../utils/MockThrottlerToggle';
import { ThrottlerGuard } from '@nestjs/throttler';

describe('quiz game pair connection', () => {
  let app: INestApplication;
  let authTestHelper: AuthTestHelper;
  let usersTestHelper: UsersTestHelper;
  let questionsTestHelper: SA_QuestionsTestHelper;
  let mockThrottlerToggle: MockThrottlerToggle;

  beforeAll(async () => {
    app = await initApp();
    setupApp(app);

    await app.init();

    usersTestHelper = new UsersTestHelper(app);
    authTestHelper = new AuthTestHelper(app, usersTestHelper);
    questionsTestHelper = new SA_QuestionsTestHelper(app);

    const throttlerGuard = app.get(ThrottlerGuard);
    mockThrottlerToggle = new MockThrottlerToggle(throttlerGuard, jest);
    mockThrottlerToggle.deactivateThrottler();

    await cleanDatabase(app);
    const questions = await questionsTestHelper.createRandomQuestions(10);
    await Promise.all(
      questions.map((q) =>
        questionsTestHelper.publishQuestion(q.id, { published: true }),
      ),
    );
  });

  afterAll(async () => {
    await app.close();
  });

  it('should connect', async () => {
    const user1 = await authTestHelper.createUserAndGetAccessToken();
    const user2 = await authTestHelper.createUserAndGetAccessToken();
    const user3 = await authTestHelper.createUserAndGetAccessToken();

    const response1 = await request(app.getHttpServer())
      .post('/pair-game-quiz/pairs/connection')
      .auth(user1, { type: 'bearer' })
      .send();

    expect(response1.status).toBe(201);
    expect(response1.body).toEqual({ gameId: expect.any(String) });

    const response2 = await request(app.getHttpServer())
      .post('/pair-game-quiz/pairs/connection')
      .auth(user2, { type: 'bearer' })
      .send();

    expect(response2.status).toBe(201);
    expect(response2.body).toEqual({ gameId: expect.any(String) });

    expect(response1.body.gameId).toBe(response2.body.gameId);

    const response3 = await request(app.getHttpServer())
      .post('/pair-game-quiz/pairs/connection')
      .auth(user3, { type: 'bearer' })
      .send();

    expect(response3.status).toBe(201);
    expect(response3.body).toEqual({ gameId: expect.any(String) });

    expect(response1.body.gameId).not.toBe(response3.body.gameId);
    console.log('user 1', response1.body.gameId);
    console.log('user 2', response2.body.gameId);
    console.log('user 3', response3.body.gameId);
  }, 500000);

  it('should conflict', async () => {
    const user1 = await authTestHelper.createUserAndGetAccessToken();
    const user2 = await authTestHelper.createUserAndGetAccessToken();
    const user3 = await authTestHelper.createUserAndGetAccessToken();

    const connect1 = await request(app.getHttpServer())
      .post('/pair-game-quiz/pairs/connection')
      .auth(user1, { type: 'bearer' })
      .send();

    const connect2 = request(app.getHttpServer())
      .post('/pair-game-quiz/pairs/connection')
      .auth(user2, { type: 'bearer' })
      .send();

    const connect3 = request(app.getHttpServer())
      .post('/pair-game-quiz/pairs/connection')
      .auth(user3, { type: 'bearer' })
      .send();

    const [res1, res2] = await Promise.all([connect2, connect3]);

    console.log('user 1', connect1.body.gameId);
    console.log('user 2', res1.body.gameId);
    console.log('user 3', res2.body.gameId);
    expect(res1.body.gameId).toBe(res2.body.gameId);

  }, 500000);

  it('should return FORBIDDEN if user already participating in active pair', async () => {
    const user1 = await authTestHelper.createUserAndGetAccessToken();
    const user2 = await authTestHelper.createUserAndGetAccessToken();

    const connectUser1 = await request(app.getHttpServer())
      .post('/pair-game-quiz/pairs/connection')
      .auth(user1, { type: 'bearer' })
      .send();

    const connectUser2 = await request(app.getHttpServer())
      .post('/pair-game-quiz/pairs/connection')
      .auth(user2, { type: 'bearer' })
      .send();

    const connectUser1Again = await request(app.getHttpServer())
      .post('/pair-game-quiz/pairs/connection')
      .auth(user1, { type: 'bearer' })
      .send();

    expect(connectUser1Again.status).toBe(HttpStatus.FORBIDDEN);
  }, 500000);
});
