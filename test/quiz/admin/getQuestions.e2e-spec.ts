import { HttpStatus, INestApplication } from '@nestjs/common';
import { setupApp } from '../../../src/core/setupApp';
import {
  DEFAULT_PAGE_SIZE,
  SortDirection,
} from '../../../src/core/dto/BaseQueryParams.dto';
import { QuestionsSortBy } from '../../../src/modules/quiz/api/dto/QuestionsQueryParams.dto';
import { cleanDatabase } from '../../utils/cleanDatabase';
import { initApp } from '../../utils/initApp';
import { SA_QuestionsTestHelper } from '../../utils/SA_QuestionsTestHelper';

describe('get questions for admin', () => {
  let app: INestApplication;
  let questionsTestHelper: SA_QuestionsTestHelper;
  const totalQuestionsCount = 50;

  beforeAll(async () => {
    app = await initApp();
    setupApp(app);
    await app.init();
    await cleanDatabase(app);

    questionsTestHelper = new SA_QuestionsTestHelper(app);
    await questionsTestHelper.createRandomQuestions(totalQuestionsCount);
  });

  afterAll(async () => {
    await app.close();
  });

  it('should return paginated view questions', async () => {
    const response = await questionsTestHelper.getQuestionsWithQuery();

    expect(response.body).toMatchObject({
      pagesCount: Math.ceil(totalQuestionsCount / DEFAULT_PAGE_SIZE),
      page: 1,
      pageSize: DEFAULT_PAGE_SIZE,
      totalCount: totalQuestionsCount,
    });

    expect(response.body.items).toEqual(
      expect.arrayContaining([questionsTestHelper.createExpectedQuestion()]),
    );
  });

  it('should respect pageNumber and pageSize query params', async () => {
    const pageNumber = 2;
    const pageSize = 5;

    const response = await questionsTestHelper.getQuestionsWithQuery({
      filter: {
        pageNumber,
        pageSize,
      },
    });

    expect(response.body.page).toBe(pageNumber);
    expect(response.body.pageSize).toBe(pageSize);
    expect(response.body.items).toHaveLength(pageSize);
  });

  it('should filter by bodySearchTerm', async () => {
    const uniqueTerm = `question-${Date.now().toString().slice(-6)}`;
    const bodies = [
      `${uniqueTerm} first question`,
      `${uniqueTerm} second question`,
      `${uniqueTerm} third question`,
    ];

    for (const body of bodies) {
      await questionsTestHelper.createQuestion({
        ...questionsTestHelper.createInputDto(),
        body,
      });
    }

    const response = await questionsTestHelper.getQuestionsWithQuery({
      filter: {
        bodySearchTerm: uniqueTerm,
      },
    });

    expect(response.body.totalCount).toBe(bodies.length);
    expect(response.body.items.map((question) => question.body).sort()).toEqual(
      [...bodies].sort(),
    );
  });

  it('should sort by createdAt asc/desc when requested', async () => {
    const uniqueTerm = `ordered-${Date.now().toString().slice(-6)}`;
    const bodies = [
      `${uniqueTerm} first question`,
      `${uniqueTerm} second question`,
    ];

    for (const body of bodies) {
      await questionsTestHelper.createQuestion({
        ...questionsTestHelper.createInputDto(),
        body,
      });
      await new Promise((resolve) => setTimeout(resolve, 10));
    }

    const ascResponse = await questionsTestHelper.getQuestionsWithQuery({
      filter: {
        bodySearchTerm: uniqueTerm,
        sortBy: QuestionsSortBy.CreatedAt,
        sortDirection: SortDirection.Asc,
      },
    });

    expect(ascResponse.body.items.map((question) => question.body)).toEqual(
      bodies,
    );

    const descResponse = await questionsTestHelper.getQuestionsWithQuery({
      filter: {
        bodySearchTerm: uniqueTerm,
        sortBy: QuestionsSortBy.CreatedAt,
        sortDirection: SortDirection.Desc,
      },
    });

    expect(descResponse.body.items.map((question) => question.body)).toEqual(
      [...bodies].reverse(),
    );
  });

  it(`should return UNAUTHORIZED if not auth`, async () => {
    await questionsTestHelper.getQuestionsWithQuery({
      auth: false,
      status: HttpStatus.UNAUTHORIZED,
    });
  });
});
