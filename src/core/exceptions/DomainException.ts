export enum DomainExceptionStatus {
  NotFound = 'NotFound',
  InvalidCredentials = 'InvalidCredentials',
  PermissionError = 'PermissionError',
  InvalidData = 'InvalidData',
}

type Extension = {
  message: string;
  field: string | null;
};

export class DomainException extends Error {
  status: DomainExceptionStatus;
  extensions: Extension[];

  constructor(
    status: DomainExceptionStatus,
    message: string,
    extensions: Extension[] = [],
  ) {
    super(message);
    this.status = status;
    this.extensions = extensions;
  }
}
