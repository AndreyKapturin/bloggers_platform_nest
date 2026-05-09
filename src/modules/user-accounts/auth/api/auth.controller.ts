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
import { UsersQueryRepository } from '../../users/infrastructure/users.query-repository';
import { type Request, type Response } from 'express';
import { SkipThrottle, ThrottlerGuard } from '@nestjs/throttler';
import { JwtRefreshAuthGuard } from '../strategies/jwt/JwtRefresh.guard';
import { LoginDto } from '../application/dto/Login.dto';
import { ExtractUserWithDeviceFromRequest } from '../../../../core/decorators/extract-user-with-device.decorator';

@UseGuards(ThrottlerGuard)
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersQueryRepository: UsersQueryRepository,
  ) {}

  @Get('me')
  @SkipThrottle()
  @UseGuards(JwtAuthGuard)
  async me(
    @ExtractUserFromRequest() dto: UserInRequestDto,
  ): Promise<ViewMeDto> {
    return this.usersQueryRepository.getMe(dto.userId);
  }

  @Post('registration')
  @HttpCode(HttpStatus.NO_CONTENT)
  async registration(@Body() dto: HttpCreateUserDto): Promise<void> {
    await this.authService.registration(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  @SkipThrottle()
  async login(
    @Req() req: Request,
    @Ip() ip: string,
    @Res({ passthrough: true }) response: Response<AccessTokenDto>,
    @ExtractUserFromRequest() dto: UserInRequestDto,
  ): Promise<AccessTokenDto> {
    const deviceName = `${req.useragent!.os} ${req.useragent!.browser}`;
    const loginDto = new LoginDto(dto.userId, ip, deviceName);
    const tokensPair = await this.authService.login(loginDto);
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
    await this.authService.resendConfirmationEmail(inputEmailDto.email);
  }

  @Post('registration-confirmation')
  @HttpCode(HttpStatus.NO_CONTENT)
  async confirmRegistration(
    @Body() dto: HttpConfirmationCodeDto,
  ): Promise<void> {
    await this.authService.confirmRegistration(dto.code);
  }

  @Post('password-recovery')
  @HttpCode(HttpStatus.NO_CONTENT)
  async recoveryPassword(@Body() dto: HttpEmailDto): Promise<void> {
    await this.authService.recoveryPassword(dto.email);
  }

  @Post('new-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePassword(@Body() dto: HttpNewPasswordDto): Promise<void> {
    await this.authService.updatePassword(dto);
  }

  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtRefreshAuthGuard)
  async refreshToken(
    @Res({ passthrough: true }) response: Response<AccessTokenDto>,
    @ExtractUserWithDeviceFromRequest() dto: UserWithDeviceInRequestDto,
  ): Promise<AccessTokenDto> {
    const tokensPair = await this.authService.refreshTokens(
      dto.deviceId,
      dto.userId,
    );
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
