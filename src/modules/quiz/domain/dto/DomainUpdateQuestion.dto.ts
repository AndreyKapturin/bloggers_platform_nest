export class DomainUpdateQuestionDto {
  constructor(
    public body: string,
    public correctAnswers: string[],
  ) {}
}
