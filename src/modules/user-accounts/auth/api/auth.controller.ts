import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { InputCreateUserDto } from '../../users/dto/CreateUser.input-dto';
import { AuthService } from '../application/auth.service';
import { LocalAuthGuard } from '../strategies/local/Local.guard';
import { ExtractUserFromRequest } from '../decorators/extract-userId.decorator';
import { AccessTokenDto } from '../dto/AccessToken.view-dto';
import { UserInRequest } from '../dto/UserInRequest.dto';
import { InputEmailDto } from '../dto/Email.input-dto';
import { ConfirmationCodeDto } from '../dto/ConfirmationCode.input-dto';
import { InputNewPasswordDto } from '../dto/NewPassword.input-dto';
import { ViewMeDto } from '../../users/dto/Me.view-dto';
import { JwtAuthGuard } from '../strategies/jwt/Jwt.guard';
import { UsersQueryRepository } from '../../users/infrastructure/users.query-repository';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersQueryRepository: UsersQueryRepository
  ) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@ExtractUserFromRequest() user: UserInRequest): Promise<ViewMeDto> {
    return this.usersQueryRepository.getMe(user.id);
  }

  @Post('registration')
  async registration(
    @Body() inputCreateUserDto: InputCreateUserDto,
  ): Promise<void> {
    await this.authService.registration(inputCreateUserDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  async login(
    @ExtractUserFromRequest() user: UserInRequest,
  ): Promise<AccessTokenDto> {
    return await this.authService.login(user.id);
  }

  @Post('registration-email-resending')
  @HttpCode(HttpStatus.NO_CONTENT)
  async resendConfirmationEmail(
    @Body() inputEmailDto: InputEmailDto,
  ): Promise<void> {
    await this.authService.resendConfirmationEmail(inputEmailDto.email);
  }

  @Post('registration-confirmation')
  @HttpCode(HttpStatus.NO_CONTENT)
  async confirmRegistration(@Body() dto: ConfirmationCodeDto): Promise<void> {
    await this.authService.confirmRegistration(dto.code);
  }

  @Post('password-recovery')
  @HttpCode(HttpStatus.NO_CONTENT)
  async recoveryPassword(@Body() inputEmailDto: InputEmailDto): Promise<void> {
    await this.authService.recoveryPassword(inputEmailDto.email);
  }

  @Post('new-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePassword(@Body() newPasswordDto: InputNewPasswordDto): Promise<void> {
    await this.authService.updatePassword(newPasswordDto);
  }
}
