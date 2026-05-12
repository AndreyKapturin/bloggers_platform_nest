import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Ip,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { HttpCreateUserDto } from '../../users/api/dto/HttpCreateUser.dto';
import { AuthService } from '../application/auth.service';
import { LocalAuthGuard } from '../strategies/local/Local.guard';
import { ExtractUserFromRequest } from '../../../../core/decorators/extract-userId.decorator';
import { AccessTokenDto } from '../dto/AccessToken.view-dto';
import {
  UserInRequestDto,
  UserWithDeviceInRequestDto,
} from '../../../../core/dto/UserInRequest.dto';
import { HttpEmailDto } from './dto/HttpEmail.dto';
import { HttpConfirmationCodeDto } from './dto/HttpConfirmationCode.dto';
import { HttpNewPasswordDto } from './dto/HttpNewPassword.dto';
import { ViewMeDto } from '../../users/api/dto/ViewMe.dto';
import { JwtAuthGuard } from '../strategies/jwt/Jwt.guard';
import { type Request, type Response } from 'express';
import { SkipThrottle, ThrottlerGuard } from '@nestjs/throttler';
import { JwtRefreshAuthGuard } from '../strategies/jwt/JwtRefresh.guard';
import { ExtractUserWithDeviceFromRequest } from '../../../../core/decorators/extract-user-with-device.decorator';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { GetMeQuery } from '../application/queries/get-me.query';
import { RegistrationCommand } from '../application/useCases/registration.use-case';
import { SendConfirmationCodeCommand } from '../application/useCases/send-confirmation-code.use-case';
import { LoginCommand } from '../application/useCases/login.use-case';
import { RegistrationConfirmationCommand } from '../application/useCases/registration-confirmation.use-case';
import { PasswordRecoveryCommand } from '../application/useCases/password-recovery.use-case';
import { NewPasswordCommand } from '../application/useCases/new-password.use-case';
import { RefreshTokensCommand } from '../application/useCases/refresh-tokens.use-case';

@UseGuards(ThrottlerGuard)
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private commandBus: CommandBus,
    private queryBus: QueryBus,
  ) {}

  @Get('me')
  @SkipThrottle()
  @UseGuards(JwtAuthGuard)
  async me(
    @ExtractUserFromRequest() dto: UserInRequestDto,
  ): Promise<ViewMeDto> {
    return this.queryBus.execute(new GetMeQuery(dto.userId));
  }

  @Post('registration')
  @HttpCode(HttpStatus.NO_CONTENT)
  async registration(@Body() dto: HttpCreateUserDto): Promise<void> {
    const command = new RegistrationCommand(dto.login, dto.email, dto.password);
    await this.commandBus.execute(command);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  async login(
    @Req() req: Request,
    @Ip() ip: string,
    @Res({ passthrough: true }) response: Response<AccessTokenDto>,
    @ExtractUserFromRequest() dto: UserInRequestDto,
  ): Promise<AccessTokenDto> {
    const deviceName = `${req.useragent!.os} ${req.useragent!.browser}`;
    const loginCommand = new LoginCommand(dto.userId, ip, deviceName);
    const tokensPair = await this.commandBus.execute(loginCommand);
    response.cookie('refreshToken', tokensPair.refreshToken, {
      secure: true,
      httpOnly: true,
    });
    return new AccessTokenDto(tokensPair.accessToken);
  }

  @Post('registration-email-resending')
  @HttpCode(HttpStatus.NO_CONTENT)
  async resendConfirmationEmail(
    @Body() inputEmailDto: HttpEmailDto,
  ): Promise<void> {
    await this.commandBus.execute(
      new SendConfirmationCodeCommand(inputEmailDto.email),
    );
  }

  @Post('registration-confirmation')
  @HttpCode(HttpStatus.NO_CONTENT)
  async confirmRegistration(
    @Body() dto: HttpConfirmationCodeDto,
  ): Promise<void> {
    const command = new RegistrationConfirmationCommand(dto.code);
    await this.commandBus.execute(command);
  }

  @Post('password-recovery')
  @HttpCode(HttpStatus.NO_CONTENT)
  async recoveryPassword(@Body() dto: HttpEmailDto): Promise<void> {
    await this.commandBus.execute(new PasswordRecoveryCommand(dto.email));
  }

  @Post('new-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePassword(@Body() dto: HttpNewPasswordDto): Promise<void> {
    const command = new NewPasswordCommand(dto.recoveryCode, dto.newPassword);
    await this.commandBus.execute(command);
  }

  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtRefreshAuthGuard)
  async refreshToken(
    @Res({ passthrough: true }) response: Response<AccessTokenDto>,
    @ExtractUserWithDeviceFromRequest() dto: UserWithDeviceInRequestDto,
  ): Promise<AccessTokenDto> {
    const command = new RefreshTokensCommand(dto.deviceId, dto.userId);
    const tokensPair = await this.commandBus.execute(command);
    response.cookie('refreshToken', tokensPair.refreshToken, {
      secure: true,
      httpOnly: true,
    });
    return new AccessTokenDto(tokensPair.accessToken);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtRefreshAuthGuard)
  async logount(
    @Res({ passthrough: true }) response: Response<AccessTokenDto>,
    @ExtractUserWithDeviceFromRequest() dto: UserWithDeviceInRequestDto,
  ): Promise<void> {
    await this.authService.logout(dto.deviceId, dto.userId);
    response.clearCookie('refreshToken', {
      secure: true,
      httpOnly: true,
    });
  }
}
