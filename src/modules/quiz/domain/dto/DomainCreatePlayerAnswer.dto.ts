import { AnswerStatus } from '../playerAnswer.entity';

export class DomainCreatePlayerAnswerDto {
  constructor(
    public status: AnswerStatus,
    public gameQuestionId: string,
    public playerId: string,
  ) {}
}
