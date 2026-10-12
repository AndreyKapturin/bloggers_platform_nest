export class DomainCreateQuestionDto {
  constructor(
    public body: string,
    public correctAnswers: string[],
  ) {}
}
