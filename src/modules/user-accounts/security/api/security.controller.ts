import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  UseGuards,
} from '@nestjs/common';
import { JwtRefreshAuthGuard } from '../../auth/strategies/jwt/JwtRefresh.guard';
import { ViewSecurityDevice } from './dto/ViewSecurityDevice.dto';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { GetSecurityDevicesQuery } from '../application/queries/get-security-devices.query';
import { ExtractUserWithDeviceFromRequest } from '../../../../core/decorators/extract-user-with-device.decorator';
import { UserWithDeviceInRequestDto } from '../../../../core/dto/UserInRequest.dto';
import { DeleteSecurityDeviceCommand } from '../application/usecases/delete-security-device.command';

@Controller('security')
@UseGuards(JwtRefreshAuthGuard)
export class SecurityDevicesController {
  constructor(
    private queryBus: QueryBus,
    private commandBus: CommandBus,
  ) {}

  @Get('devices')
  async getSecurityDevices(
    @ExtractUserWithDeviceFromRequest() dto: UserWithDeviceInRequestDto,
  ): Promise<ViewSecurityDevice[]> {
    const query = new GetSecurityDevicesQuery(dto.userId);
    return this.queryBus.execute(query);
  }

  @Delete('devices/:deviceId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteSecurityDevice(
    @Param('deviceId') deviceId: string,
    @ExtractUserWithDeviceFromRequest() dto: UserWithDeviceInRequestDto,
  ): Promise<void> {
    const deleteSecurityDeviceCommand = new DeleteSecurityDeviceCommand(
      deviceId,
      dto.userId,
    );
    await this.commandBus.execute(deleteSecurityDeviceCommand);
  }
}
