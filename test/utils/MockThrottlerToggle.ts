import { ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

type TSpyFactory = {
  spyOn: typeof jest.spyOn;
};

export class MockThrottlerToggle {
  private mockThrottlerGuardCanActivate: jest.SpyInstance<
    Promise<boolean>,
    [context: ExecutionContext],
    any
  >;
  constructor(throttlerGuard: ThrottlerGuard, spyFactory: TSpyFactory) {
    this.mockThrottlerGuardCanActivate = spyFactory.spyOn(
      throttlerGuard,
      'canActivate',
    );
  }

  activateThrottler() {
    this.mockThrottlerGuardCanActivate.mockRestore();
  }

  deactivateThrottler() {
    this.mockThrottlerGuardCanActivate.mockResolvedValue(true);
  }
}
