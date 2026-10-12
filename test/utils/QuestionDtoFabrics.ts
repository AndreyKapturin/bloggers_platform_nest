import { faker } from '@faker-js/faker';
import { HttpCreateQuestionDto } from '../../src/modules/quiz/api/dto/HttpCreateQuestion.dto';
import { ViewQuestionDto } from '../../src/modules/quiz/api/dto/ViewQuestion.view-dto';
import { DATE_ISO_STRING_REGEXP } from './reg-exp';

export const QuestionDtoFabrics = {
  createInputDto(): HttpCreateQuestionDto {
    const body = faker.lorem.sentence({
      min: 3,
      max: 5,
    });

    const correctAnswers = [
      faker.lorem.word(),
      faker.lorem.word(),
      faker.lorem.word(),
    ];

    return {
      body,
      correctAnswers,
    };
  },

  createExpectedQuestion(
    overrideFields: Partial<ViewQuestionDto> = {},
  ): ViewQuestionDto {
    return {
      id: expect.any(String),
      body: expect.any(String),
      correctAnswers: expect.arrayContaining([expect.any(String)]),
      published: expect.any(Boolean),
      createdAt: expect.stringMatching(DATE_ISO_STRING_REGEXP),
      updatedAt: expect.stringMatching(DATE_ISO_STRING_REGEXP),
      ...overrideFields,
    };
  },
};
