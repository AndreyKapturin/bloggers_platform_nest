import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtRefreshAuthGuard } from '../../auth/strategies/jwt/JwtRefresh.guard';
import { ViewSecurityDevice } from './dto/ViewSecurityDevice.dto';
import { QueryBus } from '@nestjs/cqrs';
import { GetSecurityDevicesQuery } from '../application/queries/get-security-devices.query';
import { ExtractUserWithDeviceFromRequest } from '../../../../core/decorators/extract-user-with-device.decorator';
import { UserWithDeviceInRequestDto } from '../../../../core/dto/UserInRequest.dto';

@Controller('security')
@UseGuards(JwtRefreshAuthGuard)
export class SecurityDevicesController {
  constructor(private queryBus: QueryBus) {}

  @Get('devices')
  async getSecurityDevices(
    @ExtractUserWithDeviceFromRequest() dto: UserWithDeviceInRequestDto,
  ): Promise<ViewSecurityDevice[]> {
    const query = new GetSecurityDevicesQuery(dto.userId);
    return this.queryBus.execute(query);
  }
}
