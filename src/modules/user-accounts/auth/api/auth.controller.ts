import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { HttpCreateUserDto } from '../../users/api/dto/HttpCreateUser.dto';
import { AuthService } from '../application/auth.service';
import { LocalAuthGuard } from '../strategies/local/Local.guard';
import { ExtractUserFromRequest } from '../decorators/extract-userId.decorator';
import { AccessTokenDto } from '../dto/AccessToken.view-dto';
import { UserInRequest } from '../dto/UserInRequest.dto';
import { InputEmailDto } from '../dto/Email.input-dto';
import { HttpConfirmationCodeDto } from './dto/HttpConfirmationCode.dto';
import { InputNewPasswordDto } from '../dto/NewPassword.input-dto';
import { ViewMeDto } from '../../users/api/dto/ViewMe.dto';
import { JwtAuthGuard } from '../strategies/jwt/Jwt.guard';
import { UsersQueryRepository } from '../../users/infrastructure/users.query-repository';
import { type Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersQueryRepository: UsersQueryRepository,
  ) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@ExtractUserFromRequest() user: UserInRequest): Promise<ViewMeDto> {
    return this.usersQueryRepository.getMe(user.id);
  }

  @Post('registration')
  @HttpCode(HttpStatus.NO_CONTENT)
  async registration(@Body() dto: HttpCreateUserDto): Promise<void> {
    await this.authService.registration(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  async login(
    @Res({ passthrough: true }) response: Response<AccessTokenDto>,
    @ExtractUserFromRequest() user: UserInRequest,
  ): Promise<AccessTokenDto> {
    const tokensPair = await this.authService.login(user.id);
    response.cookie('refreshToken', tokensPair.refreshToken, {
      secure: true,
      httpOnly: true,
    });
    return new AccessTokenDto(tokensPair.accessToken);
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
  async confirmRegistration(
    @Body() dto: HttpConfirmationCodeDto,
  ): Promise<void> {
    await this.authService.confirmRegistration(dto.code);
  }

  @Post('password-recovery')
  @HttpCode(HttpStatus.NO_CONTENT)
  async recoveryPassword(@Body() inputEmailDto: InputEmailDto): Promise<void> {
    await this.authService.recoveryPassword(inputEmailDto.email);
  }

  @Post('new-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updatePassword(
    @Body() newPasswordDto: InputNewPasswordDto,
  ): Promise<void> {
    await this.authService.updatePassword(newPasswordDto);
  }
}
