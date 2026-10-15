import { Controller, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../user-accounts/auth/strategies/jwt/Jwt.guard';
import { CommandBus } from '@nestjs/cqrs';
import { ConnectGamePairCommand } from '../application/useCases/connect-game-pair.use-case';
import { ExtractUserFromRequest } from '../../../core/decorators/extract-userId.decorator';
import { UserInRequestDto } from '../../../core/dto/UserInRequest.dto';

@Controller('pair-game-quiz/pairs')
@UseGuards(JwtAuthGuard)
export class QuizGamePairsController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('/connection')
  async connect(@ExtractUserFromRequest() user: UserInRequestDto) {
    const command = new ConnectGamePairCommand(user.userId);
    const gameId = await this.commandBus.execute(command);
    return { gameId }
  }
}
