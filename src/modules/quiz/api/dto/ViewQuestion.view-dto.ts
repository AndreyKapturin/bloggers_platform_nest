import { Question } from '../../domain/question.entity';

export class ViewQuestionDto {
  private constructor(
    public id: string,
    public body: string,
    public correctAnswers: string[],
    public published: boolean,
    public createdAt: string,
    public updatedAt: string,
  ) {}

  static toView(question: Question): ViewQuestionDto {
    return new ViewQuestionDto(
      question.id,
      question.body,
      question.correctAnswers,
      question.published,
      question.createdAt.toISOString(),
      question.updatedAt.toISOString(),
    );
  }
}