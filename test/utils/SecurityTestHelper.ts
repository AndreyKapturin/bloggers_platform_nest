import { HttpStatus, INestApplication } from '@nestjs/common';
import { ViewSecurityDevice } from '../../src/modules/user-accounts/security/api/dto/ViewSecurityDevice.dto';
import { ResponseWithBody } from './generics';
import request from 'supertest';
import { DATE_ISO_STRING_REGEXP } from './reg-exp';

export class SecurityTestHelper {
  constructor(private app: INestApplication) {}

  createExpectedSecurityDevice(
    overrideFields: Partial<ViewSecurityDevice> = {},
  ): ViewSecurityDevice {
    return {
      ip: expect.any(String),
      deviceId: expect.any(String),
      title: expect.any(String),
      lastActiveDate: expect.stringMatching(DATE_ISO_STRING_REGEXP),
      ...overrideFields,
    };
  }

  async getSecurityDevices<T = ViewSecurityDevice[]>(options?: {
    status?: HttpStatus;
    userAgent?: string;
    refreshToken?: string;
  }): Promise<ResponseWithBody<T>> {
    options = {
      status: HttpStatus.OK,
      ...(options ?? {}),
    };
    const getSecurityDevicesRequest = request(this.app.getHttpServer())
      .get('/security/devices')
      .expect(options.status as HttpStatus);

    if (options.userAgent) {
      getSecurityDevicesRequest.set('User-Agent', options.userAgent);
    }

    if (options.refreshToken) {
      getSecurityDevicesRequest.set(
        'Cookie',
        `refreshToken=${options.refreshToken}`,
      );
    }

    return getSecurityDevicesRequest;
  }

  async deleteSecurityDevice<T = ViewSecurityDevice[]>(
    deviceId: string,
    options?: {
      status?: HttpStatus;
      refreshToken?: string;
    },
  ): Promise<ResponseWithBody<T>> {
    options = {
      status: HttpStatus.NO_CONTENT,
      ...(options ?? {}),
    };
    const deleteSecurityDevicesRequest = request(this.app.getHttpServer())
      .delete(`/security/devices/${deviceId}`)
      .expect(options.status as HttpStatus);

    if (options.refreshToken) {
      deleteSecurityDevicesRequest.set(
        'Cookie',
        `refreshToken=${options.refreshToken}`,
      );
    }

    return deleteSecurityDevicesRequest;
  }

  async deleteAllOtherSecurityDevices<T = ViewSecurityDevice[]>(options?: {
    status?: HttpStatus;
    refreshToken?: string;
  }): Promise<ResponseWithBody<T>> {
    options = {
      status: HttpStatus.NO_CONTENT,
      ...(options ?? {}),
    };
    const deleteAllOtherSecurityDevicesRequest = request(
      this.app.getHttpServer(),
    )
      .delete('/security/devices')
      .expect(options.status as HttpStatus);

    if (options.refreshToken) {
      deleteAllOtherSecurityDevicesRequest.set(
        'Cookie',
        `refreshToken=${options.refreshToken}`,
      );
    }

    return deleteAllOtherSecurityDevicesRequest;
  }
}
